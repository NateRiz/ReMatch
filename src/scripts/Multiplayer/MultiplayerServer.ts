import Peer from "peerjs"
import MultiplayerGame from "./MultiplayerGame"
import Player from "./Player"
import Settings from "./Settings"

export default class MultiplayerServer{
    multiplayerGame: MultiplayerGame
    allClients: Player[] = [] // All clients. Players do not update with the game.
    turnTimer: number | null = null;
    settings: Settings;
    ruleDifficulty:number = 1;
    SendAll: (message: string) => void = (_: string) => {}
    
    constructor(multiplayerGame: MultiplayerGame){
        this.multiplayerGame = multiplayerGame;

        var ruleSpan = (document.querySelector("#RuleContainer") as HTMLDivElement);
        ruleSpan.classList.add("Hidden");
        var startMPButton = (document.querySelector("#StartButtonContainer") as HTMLButtonElement);
        startMPButton.classList.remove("Hidden");
        this.settings = new Settings(() => {
            this.SendAll(JSON.stringify({
                "Settings": JSON.stringify(this.settings)
            }))
        });
        this.settings.TryLoadFromStorage()

    }

    OnReceiveMessage(client: Peer.DataConnection, message: string){
        console.log(`<< [${client.peer}]: ${message}`);
        var json = JSON.parse(message);
        Object.keys(json).forEach((key)=>{
            this.DispatchCommand(client, key, json[key])
        })
    }

    OnPlayerConnect(client: Peer.DataConnection, nickname: string){
        console.log(`<< [${client.peer}] (Connection Request)`);

        var randomTeam = Math.floor(Math.random()*8)
        var player = new Player(client.peer, nickname, randomTeam);
        this.allClients.push(player)

        client.send(JSON.stringify({"Settings": JSON.stringify(this.settings)}));
        this.SendAll(JSON.stringify({"Connect": player}));
        client.send(JSON.stringify({"PlayerList": this.allClients}));

        if (this.allClients.length >= 2){
            this.EnableStartButton()
        }
    }

    OnClientDisconnect(peerId: string){
        var currentPlayer = this.multiplayerGame.players[this.multiplayerGame.turn];
        this.multiplayerGame.RemovePlayer(peerId);

        this.SendAll(JSON.stringify({
            "Disconnect": peerId
        }));

        if (currentPlayer.id === peerId){
            this.multiplayerGame.DecrementTurn();
            this.StartNextTurn();
        } else {
            var turn = this.multiplayerGame.players.indexOf(currentPlayer);
            this.SendAll(JSON.stringify({
                "Turn": turn,
            }))
        }

        const index = this.allClients.findIndex(p => {
            return p.id === peerId;
        });

        if(index !== -1){
            this.allClients.splice(index, 1);
        }
    }

    RegisterSendCallback(callback: (msg: string) => void){
        this.SendAll = callback;
    }

    private StartGame(){
        var startMPButton = (document.querySelector("#StartButtonContainer") as HTMLButtonElement);
        startMPButton.classList.add("Hidden");
        var ruleSpan = (document.querySelector("#RuleContainer") as HTMLDivElement);
        ruleSpan.classList.remove("Hidden");

        this.multiplayerGame.ResetWord(this.ruleDifficulty, this.settings.difficulty)
        var currentPlayer = this.multiplayerGame.players[this.multiplayerGame.turn];
        currentPlayer.lastRule = this.multiplayerGame.rule;

        this.SendAll(JSON.stringify({
            "Start": null,
            "Rule": this.multiplayerGame.rule,
            "TurnOrder": this.allClients,
            "Turn": 0,
            "Settings": JSON.stringify(this.settings)
        }));

        this.ResetTimer();
    }

    private StartNextTurn(wasOutOfTime: boolean=false){
        this.multiplayerGame.IncrementTurn();
        
        var currentPlayer = this.multiplayerGame.players[this.multiplayerGame.turn];
        if (wasOutOfTime){
            if (!this.settings.doesRulePersist || currentPlayer.lastRule === this.multiplayerGame.rule){
                this.multiplayerGame.ResetWord(this.ruleDifficulty, this.settings.difficulty)
            }
        }else{
            this.multiplayerGame.ResetWord(this.ruleDifficulty, this.settings.difficulty)
        }
        currentPlayer.lastRule = this.multiplayerGame.rule;
        console.log(currentPlayer.nickname, currentPlayer.lastRule)

        this.SendAll(JSON.stringify(
            {
                "Rule": this.multiplayerGame.rule,
                "Turn": this.multiplayerGame.turn,
                "NextTurn": null
            }
        ))

        this.ResetTimer();
    }

    private ResetTimer(){
        const duration = 5000;
        if (this.turnTimer != null){
            window.clearTimeout(this.turnTimer)
        }
        this.turnTimer = window.setTimeout(()=>{ this.NotifyUserOutOfTime() }, duration)
    }

    private NotifyUserOutOfTime(){
        const gamePlayer = this.multiplayerGame.players[this.multiplayerGame.turn];

        gamePlayer.DecrementLives()

        this.SendAll(JSON.stringify({
            "OutOfTime": {
                "playerId":gamePlayer.id,
                "lives":gamePlayer.lives
            }
        }));

        if (gamePlayer.lives <= 0){
            this.multiplayerGame.DecrementTurn();
            this.multiplayerGame.RemovePlayer(gamePlayer.id);

            const serverPlayer = this.GetPlayerById(gamePlayer.id);
            serverPlayer.place = this.multiplayerGame.players.length;
        }

        if (this.multiplayerGame.players.length == 1){
            this.EndGame();
        }else{
            this.StartNextTurn(true);
        }
    }

    private DispatchCommand(client: Peer.DataConnection, command: string, args: any){
        switch(command){
            case "Nickname":
                this.OnPlayerConnect(client, args)
                break;
            case "ClientGuessUpdate":
                this.OnClientGuessUpdate(client, args);
                break;
            case "SubmitGuess":
                this.OnClientGuess(client, args);
                break;
            case "TeamChoice":
                this.OnTeamChoice(client, args);
            default:
                console.log(`Invalid Command: [${command}](${args})`);
        }
    }

    private OnTeamChoice(client: Peer.DataConnection, team: number){
        this.GetPlayerById(client.peer).team = team;
        this.SendAll(JSON.stringify({
            "TeamChoice": {
                "playerId": client.peer,
                'team': team,
            }
        }));
    }

    private OnClientGuess(client: Peer.DataConnection, guess: string){
        if (!this.multiplayerGame.IsPlayersTurn(client.peer)){
            return;
        }

        const isGuessCorrect = this.multiplayerGame.TestGuess(guess);
        if (isGuessCorrect){
            this.SendAll(JSON.stringify({
                "CorrectGuess": null
            }))
            this.StartNextTurn();
        }else{
            this.SendAll(JSON.stringify({
                "IncorrectGuess": null
            }))
        }
    }

    private OnClientGuessUpdate(client: Peer.DataConnection, value: string){
        if (this.multiplayerGame.IsPlayersTurn(client.peer)){
            this.SendAll(JSON.stringify({
                "ServerGuessUpdate": value
            }));
        }
    }

    private EnableStartButton(){
        var startMPButton = (document.querySelector("#StartButton") as HTMLButtonElement);
        startMPButton.onclick = () => this.StartGame();
    }

    private EndGame(){
        const player = this.GetPlayerById(this.multiplayerGame.players[0].id);
        player.place = 0;
        this.allClients.sort((a:Player, b:Player) => a.place - b.place);

        const topPlaces = Array.from(this.allClients.slice(0,3), (p)=>p.nickname);

        this.SendAll(JSON.stringify({
            "Winner": topPlaces
        }));

        window.clearTimeout(this.turnTimer!);
    }

    // Get player by id: From ALL players, not remaining.
    private GetPlayerById(playerId: string): Player{
        const index = this.allClients.findIndex(p => {
            return p.id === playerId;
        });

        return this.allClients[index];
    }
}