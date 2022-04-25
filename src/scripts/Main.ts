import Game from './Game';
import Canvas from './Canvas'
import Peer from 'peerjs';
import ConnectionHandler from './ConnectionHandler';


function CreateHomepage(){
    (document.querySelector("#HomepageUI") as HTMLDivElement).classList.remove("Hidden");
    (document.querySelector("#PlayButton") as HTMLButtonElement).onclick = () => { Play() }
    (document.querySelector("#RestartButton") as HTMLButtonElement).onclick = () => { Play() }
    (document.querySelector("#JoinButton") as HTMLButtonElement).onclick = () => { 
        var gameId = (document.querySelector("#GameIdInput") as HTMLInputElement)?.value
        RedirectToGame(gameId)
     }

    (document.querySelector("#HostButton") as HTMLButtonElement).onclick = () => {
        (document.querySelector("#MultiPlayerUI") as HTMLDivElement).classList.remove("Hidden");
        const idSize: number = 5
        const gameId = makeId(idSize)
        RedirectToGame(gameId)
    }
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

function makeId(length: number) {
    var result = '';
    var characters = 'QWERTYUIOPLKJHGFDSAZXCVBNM0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function RedirectToGame(gameId: string){
    if(gameId != ""){
        window.location.href = `/${gameId}`
    }
}

function Main(){
    var lobbyId = window.location.pathname.replace("/", "");
    if (lobbyId != ""){
        (document.querySelector("#MultiPlayerUI") as HTMLDivElement).classList.remove("Hidden");
        var connectionHandler = new ConnectionHandler(lobbyId)
    }else{
        CreateHomepage()
    }
}


Main()