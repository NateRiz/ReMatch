import Game from './Game';
import Canvas from './Canvas'

function Play(){
    (document.querySelector("#PlayButton") as HTMLButtonElement).style.display = "none";
    (document.querySelector("#RestartButton") as HTMLButtonElement).style.display = "initial";

    var canvas: Canvas = new Canvas()    
    var game: Game = new Game()
    canvas.SubscribeDrawableObject(game)
    
    window.addEventListener('keydown', (event) => { 
        game.GuessLetter(event)
        canvas.Redraw()
    })
    window.addEventListener('resize', () => {canvas.OnResizeWindow()}, true);
}

function HostOrJoin(){
    var gameId = (document.querySelector("#GameIdInput") as HTMLInputElement)?.value

    /*
    var peer = new Peer(gameId, {
        host: location.hostname,
        port: location.port || (location.protocol === 'https:' ? 443 : 80),
        path: '/peerjs'
    })
    */
}

function Main(){
    (document.querySelector("#PlayButton") as HTMLButtonElement).onclick = () => { Play() }
    (document.querySelector("#RestartButton") as HTMLButtonElement).onclick = () => { Play() }
    (document.querySelector("#JoinButton") as HTMLButtonElement).onclick = () => { HostOrJoin() }
}


Main()