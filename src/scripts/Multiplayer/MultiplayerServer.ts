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
            this.UpdateStartButtonState();
        });
        this.settings.TryLoadFromStorage()

        var startMPButton = (document.querySelector("#StartButton") as HTMLButtonElement);
        startMPButton.onclick = () => this.StartGame();
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

        this.UpdateStartButtonState()
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

        this.UpdateStartButtonState();
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

        if (this.shouldEndGame()){
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
        this.UpdateStartButtonState();
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

    private UpdateStartButtonState(){
        if (this.allClients.length < 2){
            this.ToggleStartButton(false);
            return;
        }

        if (this.settings.teams){
            const uniqueTeams = (new Set(Array.from(this.allClients, p=>p.team))).size;
            this.ToggleStartButton(uniqueTeams >= 2);
        }else{
            this.ToggleStartButton(true);
        }
    }

    private ToggleStartButton(isEnabled: boolean){
        var startMPButton = (document.querySelector("#StartButton") as HTMLButtonElement);
        startMPButton.disabled = !isEnabled
        startMPButton.onclick = () => this.StartGame();
    }

    private shouldEndGame(){
        var remainingTeams = -1
        if (this.settings.teams){
            remainingTeams = (new Set(Array.from(this.multiplayerGame.players, p=>p.team))).size;
        } else {
            remainingTeams = this.multiplayerGame.players.length;
        }

        return remainingTeams === 1
    }

    private EndGame(){
        const player = this.GetPlayerById(this.multiplayerGame.players[0].id);
        player.place = 0;
        this.allClients.sort((a:Player, b:Player) => a.place - b.place);


        this.SendAll(JSON.stringify({
            "Winner": this.GetWinners()
        }));

        window.clearTimeout(this.turnTimer!);
    }

    private GetWinners():string[] {
        if (!this.settings.teams){
            return Array.from(this.allClients.slice(0, 3), (p)=>p.nickname)
        }

        var players = Array.from(this.allClients).sort((a:Player, b:Player) => a.place - b.place);
        var topTeams:number[] = [];
        for(var i = 0; i < players.length; i++){
            var team = players[i].team;
            if (!topTeams.includes(team)){
                topTeams.push(team);
                if (topTeams.length === 3){
                    break;
                }
            }
        }

        var winners: string[] = []
        topTeams.forEach((team) => {
            var teamPlayers = players.filter((player)=>player.team === team).map((player)=>player.nickname);
            winners.push(teamPlayers.join(' '));
        });

        return winners;
    }

    // Get player by id: From ALL players, not remaining.
    private GetPlayerById(playerId: string): Player{
        const index = this.allClients.findIndex(p => {
            return p.id === playerId;
        });

        return this.allClients[index];
    }
}