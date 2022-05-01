import Peer from "peerjs"
import Canvas from "./Canvas"

export default class MultiplayerGame{
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    players: string[] = []

    constructor(){
        var c: Canvas = new Canvas() 
        this.canvas = document.querySelector("canvas")!
        this.context = this.canvas.getContext("2d")!
        this.Draw()
    }

    OnPlayerConnect(allPlayers: string[]){
        this.players = allPlayers
        this.Draw()
    }

    private Draw(){
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

}