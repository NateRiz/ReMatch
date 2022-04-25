import Peer from "peerjs"

export default class ConnectionHandler{
    lobbyId: string
    peer!: Peer
    server: Peer.DataConnection | undefined
    clients: Peer.DataConnection[] = []

    constructor(lobbyId: string){
        this.lobbyId = lobbyId;
        this.CreatePeer();
    }

    CreatePeer(){
        this.peer = new Peer(this.lobbyId, {
            debug:3,
            host: "localhost",
            port: 5500,
            path: "/peerjs",
        });

        // Peer with id == lobbyid is the host
        this.peer.on("open", (peerid: string) => {
            this.CreateGameAsHost()
        })

        this.peer.on("error", (err) => {
            if (err.type == 'unavailable-id'){
                this.CreateClientPeer()
            }else{
                console.log(err.type, err)
            }
        })

        this.peer.on('connection', (conn) => {
            this.clients.push(conn)
            conn.on('data', function(data){
              console.log(`${conn.peer}: ${data}`);
            });
          });
    }

    CreateGameAsHost(){
        console.log("I am host.")
    }

    CreateClientPeer(){
        this.peer = new Peer("client1", {
            debug:3,
            host: "localhost",
            port: 5500,
            path: "/peerjs",
        });
        console.log(this.peer.id)
        this.peer.on("error", (err)=>{
            console.log(err.type, err)
        })
        this.peer.on("open", (peerid)=>{
            console.log("open peer with id ", peerid)
            this.server = this.peer.connect(this.lobbyId)
            this.server.on("open", () => {
                this.server!.send(`I am joining as ${this.peer.id}`)
                this.server!.on("data", function(data) {
                    console.log("recv", data)
                })
            })

        })




        
        
    }


}