import MultiplayerGame from "./MultiplayerGame";
import Settings from "./Settings";

export default class MultiplayerClient{
    multiplayerGame: MultiplayerGame;
    settings: Settings | undefined;
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
        console.log(`<< ${message}`)
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
            this.multiplayerGame.OnGuessUpdate(value);
            this.Send(JSON.stringify({
                "ClientGuessUpdate": value
            }))
        }
    }

    private OnReceiveSettings(settings: any){
        this.settings = Settings.CreateSettingsFromJSON(settings);
    }

    private DispatchCommand(command: string, args: any){
        switch(command){
            case "Settings":
                this.OnReceiveSettings(args);
                break;
            case "Connect":
                this.multiplayerGame.OnPlayerConnect(args);
                break
            case "Disconnect":
                this.multiplayerGame.OnPlayerDisconnect(args);
                break;
            case "Start":
                this.multiplayerGame.OnStartGame(this.settings!);
                break;
            case "Rule":
                this.multiplayerGame.OnReceiveRule(args);
                break;
            case "TurnOrder":
                this.multiplayerGame.OnReceiveTurnOrder(args);
                break;
            case "Turn":
                this.multiplayerGame.OnReceiveTurn(args);
                break;
            case 'ServerGuessUpdate':
                this.multiplayerGame.OnGuessUpdate(args);
                break;
            case 'IncorrectGuess':
                break;
            case 'OutOfTime':
                this.multiplayerGame.RemovePlayer(args);
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