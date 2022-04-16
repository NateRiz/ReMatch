class Canvas {
    constructor(game){
        this.canvas = document.querySelector("canvas")
        this.c = this.canvas.getContext("2d")
        this.drawableObjects = []
        this.OnResizeWindow()        
    }

    SubscribeDrawableObject(obj){
        this.drawableObjects.push(obj)
    }

    OnResizeWindow(){
        const parent = document.querySelector(".CanvasContainer")
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