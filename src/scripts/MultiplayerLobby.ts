import Peer from "peerjs"
import ConnectionHandler from "./ConnectionHandler"
import MultiplayerClient from "./MultiplayerClient"
import MultiplayerGame from "./MultiplayerGame"
import MultiplayerServer from "./MultiplayerServer"

export default class MultiplayerLobby{
    connectionHandler: ConnectionHandler
    multiplayerServer: MultiplayerServer | undefined
    multiplayerClient: MultiplayerClient
    multiplayerGame: MultiplayerGame

    constructor(lobbyId: string){
        this.multiplayerGame = new MultiplayerGame();
        this.connectionHandler = new ConnectionHandler(lobbyId, () => this.OnCreateHostCallback(), (me: string) => this.multiplayerGame.OnCreateMyClientCallback(me))
        this.multiplayerClient = new MultiplayerClient(this.multiplayerGame)
        this.connectionHandler.RegisterClientCallback((msg: string) => this.multiplayerClient.OnReceiveMessage(msg))
        this.multiplayerClient.RegisterSendCallback((msg: string) => this.connectionHandler.SendToServer(msg))

    }

    OnCreateHostCallback(){
        this.multiplayerServer = new MultiplayerServer(this.multiplayerGame);
        this.connectionHandler.RegisterServerCallback((conn: Peer.DataConnection, message: string) => this.multiplayerServer!.OnReceiveMessage(conn, message));

        this.multiplayerServer.RegisterSendCallback((msg: string) => this.connectionHandler.SendToAllClients(msg))
    }
}