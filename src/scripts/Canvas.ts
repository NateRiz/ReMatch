import Drawable from "./Drawable"

export default class Canvas {
    canvas: HTMLCanvasElement
    c: CanvasRenderingContext2D
    drawableObjects: Array<Drawable>
    
    constructor(){
        this.canvas = document.querySelector("canvas")!
        this.c = this.canvas.getContext("2d")!
        this.drawableObjects = []
        this.OnResizeWindow()
        window.addEventListener('resize', () => {this.OnResizeWindow()}, true);
    }

    SubscribeDrawableObject(obj: Drawable){
        this.drawableObjects.push(obj)
    }

    OnResizeWindow(){
        const parent: HTMLDivElement = document.querySelector(".CanvasContainer")!
        this.canvas.width = parent.offsetWidth
        this.canvas.height = parent.offsetHeight
        this.Redraw()
    }

    Redraw(){
        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawableObjects.forEach(obj => {
            obj.Draw()
        });
    }
}