import MultiplayerLobby from "./MultiplayerLobby";

function main(){
    var lobbyId = "rematchgame_" + window.location.pathname.replace("/", "");
    if (lobbyId != ""){
        var multiplayerLobby = new MultiplayerLobby(lobbyId)
    }
}

main();