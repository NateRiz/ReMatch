import MultiplayerGame from "./MultiplayerGame";
import Settings from "./Settings";

export default class MultiplayerClient{
    multiplayerGame: MultiplayerGame;
    settings: Settings | undefined;
    isGameStarted: boolean = false;
    Send: (message: string) => void = (_: string) => {}
    
    constructor(multiplayerGame: MultiplayerGame){
        this.multiplayerGame = multiplayerGame;

        window.addEventListener('keydown', (event) => {
            const hiddenTextBox = document.querySelector("#HiddenInput") as HTMLInputElement;
            const activeElement = document.activeElement
            if (activeElement !== hiddenTextBox && activeElement !== document.body){
                return;
            }

            if (event.key === "Enter"){
                this.SubmitGuess()
            }else{
                hiddenTextBox.focus();
            }
        });

        const hiddenInput = (document.querySelector("#HiddenInput") as HTMLInputElement)
        const self = this;
        hiddenInput.setAttribute('input-prev-val', '')
        hiddenInput.addEventListener('input', function(e){
            if(this.checkValidity()){
                hiddenInput.setAttribute('input-prev-val', this.value)
                self.OnType(this.value);
            } else {
              this.value = hiddenInput.getAttribute('input-prev-val')!;
            }
        }); 

        const retryButton = document.querySelector("#Restart") as HTMLButtonElement;
        retryButton.onclick = () => { this.RestartGame(); }
    }

    OnReceiveMessage(message: string){
        var json = JSON.parse(message);
        Object.keys(json).forEach((key)=>{
            this.DispatchCommand(key, json[key])
        })
    }

    RegisterSendCallback(callback: (msg: string) => void){
        this.Send = callback
    }

    private RestartGame(){
        var lobbyId = window.location.pathname.replace("/", "");
        lobbyId = lobbyId.slice(1,) + lobbyId[0]
        window.location.href = `/${lobbyId}`
    }

    private SubmitGuess(){
        if (this.multiplayerGame.IsMyTurn() && this.multiplayerGame.guess !== ''){
            this.Send(JSON.stringify({
                "SubmitGuess": this.multiplayerGame.guess
            }));
        }
    }

    private OnType(value: string){
        if (this.multiplayerGame.IsMyTurn()){
            this.multiplayerGame.guess = value
            this.multiplayerGame.guessSpan.textContent = this.multiplayerGame.guess

            this.multiplayerGame.OnGuessUpdate(value);
            this.Send(JSON.stringify({
                "ClientGuessUpdate": value
            }))
        }
    }

    private OnStartGame(){
        this.isGameStarted = true;
        this.multiplayerGame.OnStartGame(this.settings!);

        this.multiplayerGame.players.forEach((p) => {
            p.playerCard?.parentElement?.querySelectorAll(".PlayerButton").forEach((btn) => {
                const btnImg = (btn as HTMLImageElement);
                btnImg.onclick = () => this.TryBuyPlayerButton(btnImg, p.id);
            })
        })
    }

    private OnReceiveSettings(settings: any){
        this.settings = Settings.CreateSettingsFromJSON(JSON.parse(settings));

        this.multiplayerGame.players.forEach((player)=> {
            player.settings = this.settings;
            player.CheckAndUpdateTeamUI()
        })

        if (!this.isGameStarted){
            const myPlayer = this.multiplayerGame.GetPlayerById(this.multiplayerGame.me)
            myPlayer?.ToggleTeamChoiceUI()
        }
    }

    private OnReceivePlayerList(players: object[]){
        this.multiplayerGame.OnReceivePlayerList(players, this.settings!);

        document.querySelectorAll(".TeamChoice").forEach((elem)=> {
            (elem as HTMLSpanElement).onclick = () => {
                const team = parseInt(elem.id.replace("TeamChoice",""))
                this.Send(JSON.stringify({"TeamChoice": team}))
            }
        })

        const myPlayer = this.multiplayerGame.GetPlayerById(this.multiplayerGame.me)
        if (!this.isGameStarted){
            myPlayer?.ToggleTeamChoiceUI();
        }
    }

    private TryBuyPlayerButton(btn: HTMLImageElement, playerId: string){
        const buttonType = btn.getAttribute("data-button")
        if (!buttonType){
            return;
        }

        this.Send(JSON.stringify({
            "Purchase": {
                "PlayerId": playerId,
                "ButtonType": buttonType,
            }
        }));
    }

    private OnTeamChoice(playerInfo: any){
        const player = this.multiplayerGame.GetPlayerById(playerInfo.playerId);
        player?.SetTeam(playerInfo.team);
    }

    private DispatchCommand(command: string, args: any){
        switch(command){
            case "Settings":
                this.OnReceiveSettings(args);
                break;
            case "Points":
                this.multiplayerGame.OnReceivePoints(args);
                break;
            case "Status":
                this.multiplayerGame.OnReceiveStatus(args);
                break;
            case "TeamChoice":
                this.OnTeamChoice(args);
                break;
            case "PlayerList":
                this.OnReceivePlayerList(args)
                break;
            case "Connect":
                this.multiplayerGame.OnPlayerConnect(args, this.settings!);
                break
            case "Disconnect":
                this.multiplayerGame.OnPlayerDisconnect(args);
                break;
            case "Start":
                this.OnStartGame()
                break;
            case "Rule":
                this.multiplayerGame.OnReceiveRule(args);
                break;
            case "TurnEndTime":
                this.multiplayerGame.OnReceiveTurnEndTime(args);
                break;
            case "Turn":
                this.multiplayerGame.OnReceiveTurn(args);
                break;
            case 'ServerGuessUpdate':
                this.multiplayerGame.OnGuessUpdate(args);
                break;
            case 'IncorrectGuess':
                this.multiplayerGame.OnIncorrectGuess();
                break;
            case 'OutOfTime':
                this.multiplayerGame.OnOutOfTime(args);
                break;
            case 'NextTurn':
                this.multiplayerGame.OnNextTurn();
                break
            case "LettersRemaining":
                this.multiplayerGame.OnReceiveRemainingLetters(args);
                break;
            case 'CorrectGuess':
                this.multiplayerGame.OnCorrectGuess();
                break;
            case 'Winner':
                this.multiplayerGame.EndGame(args);
                break;
            default:
                console.log(`Invalid Command: [${command}](${args})`)
        }
    }
}