export default class MultiplayerClient{

    Send: (message: string) => void = (_: string) => {}
    constructor(){

    }

    OnReceiveMessage(message: string){
        console.log(message)
    }


    RegisterSendCallback(callback: (msg: string) => void){
        this.Send = callback
    }

}