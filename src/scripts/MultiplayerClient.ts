import MultiplayerGame from "./MultiplayerGame";

export default class MultiplayerClient{
    multiplayerGame: MultiplayerGame;
    Send: (message: string) => void = (_: string) => {}
    
    constructor(multiplayerGame: MultiplayerGame){
        this.multiplayerGame = multiplayerGame;
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
            default:
                console.log(`Invalid Command: [${command}](${args})`)
        }
    }


}