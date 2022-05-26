import Peer from "peerjs"
import Cookies from "../Cookies"
import GlobalConfig from "../GlobalConfig"

export default class ConnectionHandler{
    lobbyId: string
    peerClient!: Peer // Everyone has a peerClient, even the host
    peerHost: Peer | undefined // Only the host has a peerHost
    server!: Peer.DataConnection // Every client should know the server
    clients: Peer.DataConnection[] = [] // Only the server has clients
    isHost:boolean = false;
    ClientMessageHandler: (msg: string) => void = (_: string) => {}
    ServerMessageHandler: (conn: Peer.DataConnection, msg: string) => void = (_c:Peer.DataConnection, _s: string) => {}
    OnClientDisconnect: (peerId: string) => void = (_: string) => {}
    OnCreateHostCallback: ()=>void = () => {}
    OnCreateMyClientCallback: (me: string) => void = (_: string) => {}

    constructor(lobbyId: string, OnCreateHostCallback: ()=>void, OnCreateMyClientCallback: (_: string)=>void){
        this.lobbyId = lobbyId;
        this.TryCreatePeerHost();
        this.CreatePeerClient();
        this.OnCreateHostCallback = OnCreateHostCallback;
        this.OnCreateMyClientCallback = OnCreateMyClientCallback;
    }

    IsHost(): boolean{
        return this.isHost;
    }

    SendToServer(message: string){
        this.server.send(message);
    }

    SendToAllClients(message: string){
        this.clients.forEach((client)=>{
            client.send(message);
        })
    }

    RegisterClientCallback(callback: (_: string) => void){
        this.ClientMessageHandler = callback;
    }
    
    RegisterServerCallback(callback: (_c:Peer.DataConnection, _s: string) => void){
        this.ServerMessageHandler = callback;
    }

    RegisterServerClientDisconnect(callback: (peerId: string) => void){
        this.OnClientDisconnect = callback;
    }

    private TryCreatePeerHost(){
        // Peer with id == lobbyid is the host
        this.peerHost = new Peer(this.lobbyId, {
            // debug:3,
            host: GlobalConfig.HOST,
            port: GlobalConfig.PORT,
            path: GlobalConfig.PATH,
            secure: true
        });

        this.peerHost.on("open", (peerid: string) => {
            this.isHost = true
            this.peerHost!.on('connection', (conn) => {
                this.clients.push(conn)
                
                conn.on('data', (data) => {
                  this.ServerMessageHandler(conn, data)
                });

                conn.on("close", () => {
                    this.OnClientDisconnect(conn.peer);
                })
            });
            this.OnCreateHostCallback()
        })

        this.peerHost.on("error", (err) => {
            if (err.type == 'unavailable-id'){
                this.peerHost = undefined
            }else{
                console.log(err.type, err)
            }
        })
    }

    private CreatePeerClient(){
        this.peerClient = new Peer({
            // debug:3,
            host: GlobalConfig.HOST,
            port: GlobalConfig.PORT,
            path: GlobalConfig.PATH,
            secure: true
        });

        this.peerClient.on("error", (err)=>{
            console.log(err.type, err)
        })

        this.peerClient.on("open", (peerid)=>{
            this.OnCreateMyClientCallback(peerid);
            this.server = this.peerClient.connect(this.lobbyId, {reliable:true})
            
            this.server.on("open", () => {
                this.server!.on("data", (data) => {
                    this.ClientMessageHandler(data)
                })

                this.server!.send(JSON.stringify({"Nickname":Cookies.GetNickName()}))
            })

        })




        
        
    }


}