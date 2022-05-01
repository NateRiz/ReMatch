import Peer from "peerjs"

export default class ConnectionHandler{
    lobbyId: string
    peerClient!: Peer // Everyone has a peerClient, even the host
    peerHost: Peer | undefined // Only the host has a peerHost
    server!: Peer.DataConnection // Every client should know the server
    clients: Peer.DataConnection[] = [] // Only the server has clients
    isHost:boolean = false;
    ClientMessageHandler: (msg: string) => void = (_: string) => {}
    ServerMessageHandler: (conn: Peer.DataConnection, msg: string) => void = (_c:Peer.DataConnection, _s: string) => {}
    OnCreateHostCallback: ()=>void = ()=>{}
    ServerOnPlayerConnectCallback: (conn: Peer.DataConnection) => void = (_:Peer.DataConnection) => {}

    constructor(lobbyId: string, OnCreateHostCallback = ()=>{}){
        this.lobbyId = lobbyId;
        this.TryCreatePeerHost();
        this.CreatePeerClient();
        this.OnCreateHostCallback = OnCreateHostCallback;
    }

    IsHost(): boolean{
        return this.isHost;
    }

    SendToServer(message: string){
        this.server.send(message);
    }

    SendToAllClients(message: string){
        console.log(`>> [Server]: ${message}`)
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

    RegisterOnPlayerConnectCallback(callback: (_c:Peer.DataConnection) => void){
        this.ServerOnPlayerConnectCallback = callback;
    }

    private TryCreatePeerHost(){
        // Peer with id == lobbyid is the host
        this.peerHost = new Peer(this.lobbyId, {
            // debug:3,
            host: "localhost",
            port: 5500,
            path: "/peerjs",
        });

        this.peerHost.on("open", (peerid: string) => {
            console.log("I am the host")
            this.isHost = true
            this.peerHost!.on('connection', (conn) => {
                this.clients.push(conn)
                this.ServerOnPlayerConnectCallback(conn)
                conn.on('data', (data) => {
                  this.ServerMessageHandler(conn, data)
                });
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
            host: "localhost",
            port: 5500,
            path: "/peerjs",
        });

        this.peerClient.on("error", (err)=>{
            console.log(err.type, err)
        })

        this.peerClient.on("open", (peerid)=>{
            console.log("open peer with id ", peerid)
            this.server = this.peerClient.connect(this.lobbyId, {reliable:true})
            
            this.server.on("open", () => {
                this.server!.on("data", (data) => {
                    this.ClientMessageHandler(data)
                })

                this.server!.send(JSON.stringify({"Established":null}))
            })

        })




        
        
    }


}