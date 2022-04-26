import Peer from "peerjs"

export default class MultiplayerServer{
    SendAll: (message: string) => void = (_: string) => {}
    
    constructor(){
        (document.querySelector("#LeaveButton") as HTMLButtonElement).onclick = () => this.SendAll("Testing from server")
    }

    OnReceiveMessage(client: Peer.DataConnection, message: string){
        console.log(client.peer, message)
    }


    RegisterSendCallback(callback: (msg: string) => void){
        this.SendAll = callback
    }
}