import Peer from "peerjs"
import MultiplayerGame from "./MultiplayerGame"
import Player from "./Player"

export default class MultiplayerServer{
    multiplayerGame: MultiplayerGame
    clients: Player[] = []
    turnTimer: number | null = null;
    SendAll: (message: string) => void = (_: string) => {}
    
    constructor(multiplayerGame: MultiplayerGame){
        this.multiplayerGame = multiplayerGame;

        var ruleSpan = (document.querySelector("#RuleContainer") as HTMLDivElement);
        ruleSpan.classList.add("Hidden");
        var startMPButton = (document.querySelector("#StartButtonContainer") as HTMLButtonElement);
        startMPButton.classList.remove("Hidden");

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

        var player = new Player(client.peer, nickname);
        this.clients.push(player)

        this.SendAll(JSON.stringify({"Connect": this.clients}));

        if (this.clients.length >= 2){
            this.EnableStartButton()
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

        this.multiplayerGame.ResetWord()
        this.SendAll(JSON.stringify(
            {
                "Start": null,
                "Rule": this.multiplayerGame.rule,
                "TurnOrder": this.clients,
                "Turn": 0,
            }
        ))

        this.ResetTimer();
    }

    private StartNextTurn(){
        this.multiplayerGame.ResetWord()
        this.multiplayerGame.IncrementTurn();
        this.SendAll(JSON.stringify(
            {
                "Rule": this.multiplayerGame.rule,
                "Turn": this.multiplayerGame.turn,
            }
        ))

        this.ResetTimer();
    }

    private ResetTimer(){
        const duration = 20000;
        if (this.turnTimer != null){
            window.clearTimeout(this.turnTimer)
        }
        this.turnTimer = window.setTimeout(()=>{ this.NotifyUserOutOfTime() }, duration)
    }

    private NotifyUserOutOfTime(){
        const player = this.multiplayerGame.players[this.multiplayerGame.turn];
        this.SendAll(JSON.stringify({
            "OutOfTime": player.id
        }));
        this.multiplayerGame.DecrementTurn();
        this.multiplayerGame.RemovePlayer(player.id);

        if (this.multiplayerGame.players.length == 1){
            // EndGame();
        }else{
            this.StartNextTurn();
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
            default:
                console.log(`Invalid Command: [${command}](${args})`);
        }
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

}