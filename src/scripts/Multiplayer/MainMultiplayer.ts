import MultiplayerLobby from "./MultiplayerLobby";

function main(){
    var lobbyId = window.location.pathname.replace("/", "");
    if (lobbyId != ""){
        var multiplayerLobby = new MultiplayerLobby(lobbyId)
    }
}

main();