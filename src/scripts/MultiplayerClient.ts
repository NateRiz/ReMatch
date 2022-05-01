import Canvas from "./Canvas";
import MultiplayerGame from "./MultiplayerGame";

export default class MultiplayerClient{
    multiplayerGame: MultiplayerGame;
    canvas: Canvas
    Send: (message: string) => void = (_: string) => {}
    
    constructor(multiplayerGame: MultiplayerGame){
        this.multiplayerGame = multiplayerGame;
        this.canvas = new Canvas()
        this.canvas.SubscribeDrawableObject(this.multiplayerGame) 
    }

    OnReceiveMessage(message: string){
        console.log(`<< ${message}`)
        var json = JSON.parse(message);
        Object.keys(json).forEach((key)=>{
            this.DispatchCommand(key, json[key])
        })
    }

    RegisterSendCallback(callback: (msg: string) => void){
        this.Send = callback
    }

    private DispatchCommand(command: string, args: any){
        switch(command){
            case "Connect":
                this.multiplayerGame.OnPlayerConnect(args)
                break
            case "Start":
                this.multiplayerGame.OnStartGame();
                break;
            case "Rule":
                this.multiplayerGame.OnReceiveRule(args);
                break;
            case "TurnOrder":
                this.multiplayerGame.OnReceiveTurnOrder(args);
                break;
            case "Turn":
                this.multiplayerGame.OnReceiveTurn(args);
                break;
            default:
                console.log(`Invalid Command: [${command}](${args})`)
        }
    }


}