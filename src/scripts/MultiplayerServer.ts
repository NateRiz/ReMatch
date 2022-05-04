import Peer from "peerjs"
import MultiplayerGame from "./MultiplayerGame"

export default class MultiplayerServer{
    multiplayerGame: MultiplayerGame
    clients: string[] = []
    SendAll: (message: string) => void = (_: string) => {}
    
    constructor(multiplayerGame: MultiplayerGame){
        this.multiplayerGame = multiplayerGame;
        (document.querySelector("#LeaveButton") as HTMLButtonElement).onclick = () => this.SendAll("{Testing from server:0}");

        var startMPButton = (document.querySelector("#StartMultiplayerButton") as HTMLButtonElement)
        startMPButton.parentElement!.classList.remove("Hidden")

    }

    OnReceiveMessage(client: Peer.DataConnection, message: string){
        console.log(`<< [${client.peer}]: ${message}`);
        var json = JSON.parse(message);
        Object.keys(json).forEach((key)=>{
            this.DispatchCommand(client, key, json[key])
        })
    }

    OnPlayerConnect(client: Peer.DataConnection){
        console.log(`<< [${client.peer}] (Connection Request)`);
        this.clients.push(client.peer)

        if (this.clients.length >= 2){
            this.EnableStartButton()
        }
    }

    RegisterSendCallback(callback: (msg: string) => void){
        this.SendAll = callback;
    }

    private StartGame(){
        this.multiplayerGame.ResetWord()
        this.SendAll(JSON.stringify(
            {
                "Start": null,
                "Rule": this.multiplayerGame.rule,
                "TurnOrder": this.clients,
                "Turn": 0,
            }
        ))
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
    }

    private DispatchCommand(client: Peer.DataConnection, command: string, args: any){
        switch(command){
            case "Established":
                this.SendAll(JSON.stringify({"Connect": this.clients}));
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
        var startMPButton = (document.querySelector("#StartMultiplayerButton") as HTMLButtonElement);
        startMPButton.disabled = false;
        startMPButton.onclick = () => this.StartGame();
    }

}