import Game from './Game';
import Canvas from './Canvas'
import Peer from 'peerjs';

function CreateHomepage(){
    (document.querySelector("#HomepageUI") as HTMLDivElement).classList.remove("Hidden");
    (document.querySelector("#PlayButton") as HTMLButtonElement).onclick = () => { Play() }
    (document.querySelector("#RestartButton") as HTMLButtonElement).onclick = () => { Play() }
    (document.querySelector("#JoinButton") as HTMLButtonElement).onclick = () => { Join() }
}

function Play(){
    (document.querySelector("#HomepageUI") as HTMLButtonElement).classList.add("Hidden");
    (document.querySelector("#SinglePlayerUI") as HTMLButtonElement).classList.remove("Hidden");

    var canvas: Canvas = new Canvas()    
    var game: Game = new Game()
    canvas.SubscribeDrawableObject(game)
    
    window.addEventListener('keydown', (event) => { 
        game.GuessLetter(event)
        canvas.Redraw()
    })
    window.addEventListener('resize', () => {canvas.OnResizeWindow()}, true);
}

function JoinLobby(lobbyId: string){
    (document.querySelector("#MultiPlayerUI") as HTMLDivElement).classList.remove("Hidden");
    return
    const peer = new Peer({
        debug:3,
        host: "localhost",
        port: 5500,
        path: "/peerjs",
    });
    peer.connect(lobbyId)
    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
      });

    peer.on('connection', function(conn) {
        conn.send("hey!")
        conn.on('data', function(data){
          console.log(data);
        });
      });
}

function Join(){
    var gameId = (document.querySelector("#GameIdInput") as HTMLInputElement)?.value
    if(gameId != ""){
        window.location.href = `/${gameId}`
    }
}

function Main(){
    var lobbyId = window.location.pathname.replace("/", "");
    if (lobbyId != ""){
        JoinLobby(lobbyId)
    }else{
        CreateHomepage()
    }
}


Main()