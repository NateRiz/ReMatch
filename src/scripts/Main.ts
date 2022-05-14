import Game from './ClassicGame';
import Canvas from './Canvas'
import MultiplayerLobby from './MultiplayerLobby';


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
    var classicGame: Game = new Game()
    canvas.SubscribeDrawableObject(classicGame)
    
    window.addEventListener('keydown', (event) => { 
        classicGame.GuessLetter(event)
        canvas.Redraw()
    })
}

function SetNickName(){
    var name = GetNickName();
    (document.querySelector("#NickName") as HTMLInputElement).value = name;
}

function SaveNickName(nickname: string){
    window.localStorage.setItem("nickname", nickname)
}

function GetNickName(){
    var nickname = window.localStorage.getItem("nickname");
    if (nickname !== null){
        return nickname;
    }

    return "Guest" + (Math.floor(Math.random()*8998) + 1000).toString();
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

function SetupNavBar(){
    SetNickName();
    const nicknameInput = (document.querySelector("#NickName") as HTMLInputElement); 
    nicknameInput.addEventListener('change', (_) => {
        if (nicknameInput.value.length > 0){
            SaveNickName(nicknameInput.value);
        }
    });
}

function Main(){
    SetupNavBar();
    var lobbyId = window.location.pathname.replace("/", "");
    if (lobbyId != ""){
        (document.querySelector("#MultiPlayerUI") as HTMLDivElement).classList.remove("Hidden");
        var multiplayerLobby = new MultiplayerLobby(lobbyId)
        multiplayerLobby.Start()
    }else{
        CreateHomepage()
    }
}


Main()