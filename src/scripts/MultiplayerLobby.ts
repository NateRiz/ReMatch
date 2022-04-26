import Peer from "peerjs"
import ConnectionHandler from "./ConnectionHandler"
import MultiplayerClient from "./MultiplayerClient"
import MultiplayerServer from "./MultiplayerServer"

export default class MultiplayerLobby{
    connectionHandler: ConnectionHandler
    multiplayerServer: MultiplayerServer | undefined
    multiplayerClient: MultiplayerClient

    constructor(lobbyId: string){
        this.connectionHandler = new ConnectionHandler(lobbyId, ()=>this.OnCreateHostCallback())

        this.multiplayerClient = new MultiplayerClient()
        this.connectionHandler.RegisterClientCallback((msg: string) => this.multiplayerClient.OnReceiveMessage(msg))
        this.multiplayerClient.RegisterSendCallback((msg: string) => this.connectionHandler.SendToServer(msg))
    }

    Start(){
    }

    OnCreateHostCallback(){
        this.multiplayerServer = new MultiplayerServer();
        this.connectionHandler.RegisterServerCallback((client: Peer.DataConnection, message: string) => this.multiplayerServer!.OnReceiveMessage(client, message))
        this.multiplayerServer.RegisterSendCallback((msg: string) => this.connectionHandler.SendToAllClients(msg))
    }
}