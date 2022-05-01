import Drawable from "./Drawable"
import GameState from "./GameState"
import RuleGenerator from "./RuleGenerator"

export default class MultiplayerGame extends Drawable{
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    players: string[] = []
    ruleGenerator: RuleGenerator
    rule: string = ""
    guess: string = ""
    ruleRegex: RegExp
    gameState: number = GameState.LOBBY;
    turn: string = ""
    
    constructor(){
        super()
        this.ruleGenerator = new RuleGenerator()
        this.canvas = document.querySelector("canvas")!
        this.context = this.canvas.getContext("2d")!
        this.ruleRegex = new RegExp(".*")
        this.Draw()

    }

    OnStartGame(){
        this.gameState = GameState.INGAME
    }

    OnPlayerConnect(allPlayers: string[]){
        this.players = allPlayers
        this.Draw()
    }

    OnReceiveRule(rule: string){
        this.rule = rule
        this.Draw()
    }

    OnReceiveTurnOrder(allPlayers: string[]){
        this.players = allPlayers
        this.Draw()
    }

    OnReceiveTurn(player: string){
        this.turn = player
        this.Draw()
    }


    // Server Only Functions
    ResetWord(){
        this.rule = this.ruleGenerator._GetRule(1)
        this.ruleRegex = new RegExp(this.rule.replaceAll("*",".*").replaceAll("+", ".+"), "i");
        this.guess = ""
    }
    // End Server Functions

    public Draw(){
        switch(this.gameState){
            case GameState.LOBBY:
                this.DrawLobby();
                break;
            case GameState.INGAME:
                this.DrawGame();
                break;
            default:
                break;
        }
    }

    private DrawLobby(){
        this.context.fillStyle = 'white';
        var fontSize = 42
        this.context.font = `bold ${fontSize}px Monospace`
        var buffer = 16

        const connectedText = "Connected:"
        var x = buffer
        var y = fontSize
        this.context.fillText(connectedText, x, y)

        this.players.forEach((p) => {
            y += fontSize
            this.context.fillText(p, x, y)
        })
    }

    private DrawGame() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw Rule
        var buffer = 16
        var fontSize = 42
        this.context.fillStyle = 'white';
        /*
        if (this.lastWordIsError){
            this.c.fillStyle = "red"
        } else {
            this.c.fillStyle = 'white';
        }
        */
        this.context.font = `bold ${fontSize}px Monospace`
        var x = this.canvas.width / 2 - this.context.measureText(this.rule).width/2
        var y = fontSize
        this.context.fillText(this.rule, x, y)
    
        // Draw Guess
        this.context.fillStyle = 'white';
        x = this.canvas.width / 2 - this.context.measureText(this.guess).width/2
        y = this.canvas.height / 2 - fontSize/2
        this.context.fillText(this.guess, x, y)

        // Draw Rules
        var text = "Rules"
        x = this.canvas.width - buffer - this.context.measureText(text).width
        y = fontSize * 4
        this.context.fillText(text, x, y)
        // Draw Actual Rules
        text = ["*", "*+", "*+|"][2]
        x = this.canvas.width - buffer - this.context.measureText(text).width
        y = fontSize * 5
        this.context.fillText(text, x, y)
    }

}