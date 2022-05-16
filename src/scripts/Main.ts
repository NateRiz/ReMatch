import ClassicGame from './ClassicGame';
import Canvas from './Canvas'
import MultiplayerLobby from './MultiplayerLobby';
import Cookies from './Cookies';


function CreateHomepage(){
    //(document.querySelector("#HomepageUI") as HTMLDivElement).classList.remove("Hidden");
    (document.querySelector("#ClassicButton") as HTMLButtonElement).onclick = () => { PlayClassic() }
    (document.querySelector("#OnlineButton") as HTMLButtonElement).onclick = () => { GoToOnlineLobby() }
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

function GoToOnlineLobby(){
    document.querySelector("#BaseLobby")?.classList.add("Hidden")
    document.querySelector("#OnlineLobby")?.classList.remove("Hidden")
}

function PlayClassic(){
    window.location.href = "/play"
    return
    (document.querySelector("#HomepageUI") as HTMLButtonElement).classList.add("Hidden");
    (document.querySelector("#SinglePlayerUI") as HTMLButtonElement).classList.remove("Hidden");

    var classicGame: ClassicGame = new ClassicGame()

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
    Cookies.SetNickName();
    const nicknameInput = (document.querySelector("#NicknameInput") as HTMLInputElement); 
    nicknameInput.addEventListener('change', (_) => {
        Cookies.SaveNickName(nicknameInput.value);
    });
}

function Main(){
    SetupNavBar();
    CreateHomepage()
    return;
    var lobbyId = window.location.pathname.replace("/", "");
    if (lobbyId != ""){
        (document.querySelector("#MultiPlayerUI") as HTMLDivElement).classList.remove("Hidden");
        var multiplayerLobby = new MultiplayerLobby(lobbyId)
    }else{
    }
}


Main()