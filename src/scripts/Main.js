//import Peer from 'peerjs';
import Game from './Game.js'
import Canvas from './Canvas.js'

function Play(){
    document.querySelector("#PlayButton").style.display = "none";
    document.querySelector("#RestartButton").style.display = "initial";

    var canvas = new Canvas()    
    var game = new Game()
    canvas.SubscribeDrawableObject(game)
    
    window.addEventListener('keydown', (event) => { 
        game.GuessLetter(event)
        canvas.Redraw()
    })
    window.addEventListener('resize', () => {canvas.OnResizeWindow()}, true);
}

function HostOrJoin(){
    var gameId = document.querySelector("#GameIdInput").value
    var peer = new Peer(gameId, {
        host: location.hostname,
        port: location.port || (location.protocol === 'https:' ? 443 : 80),
        path: '/peerjs'
    })

}

function Main(){
    document.querySelector("#PlayButton").onclick = () => { Play() }
    document.querySelector("#RestartButton").onclick = () => { Play() }
    document.querySelector("#JoinButton").onclick = () => { HostOrJoin() }
}


Main()