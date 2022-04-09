class Drawable {
    constructor(){}
    Draw(){
        throw "Abstract Drawable Draw Exception!"
    }
}
class Game extends Drawable{
    constructor(context){
        super()
        this.rule = "St*e"
        this.bonus = "St*che"
        this.guess = ""
        this.canvas = document.querySelector("canvas")
        this.c = this.canvas.getContext("2d")
        this.Draw()
    }

    GuessLetter(event){
        const key = event.key.toLowerCase();

        if (key == "backspace"){
            this.guess = this.guess.slice(0,-1)
            return;
        }
    
        if (key.length !== 1) {
            return;
        }
    
        const isLetter = (key >= "a" && key <= "z");
        if (!isLetter) {
            return
        }
        
        game.guess += key
    }

    Draw() {
        var fontsize = 42
        this.c.font = `bold ${fontsize}px Monospace`
        var x = this.canvas.width / 2 - this.c.measureText(this.rule).width/2
        var y = fontsize
        this.c.fillText(this.rule, x, y)
        x = this.canvas.width / 2 - this.c.measureText(this.bonus).width/2
        this.c.fillText(this.bonus, x, y*2)
    
        x = this.canvas.width / 2 - this.c.measureText(this.guess).width/2
        y = this.canvas.height / 2 - fontsize/2
        this.c.fillText(this.guess, x, y)
    }
};

class Canvas{
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

function main(){
    canvas = new Canvas()    
    game = new Game()
    canvas.SubscribeDrawableObject(game)
    
    window.addEventListener('keydown', (event) => { 
        game.GuessLetter(event)
        canvas.Redraw()
    })
    window.addEventListener('resize', () => {canvas.OnResizeWindow()}, true);
    
}

/**
 * coolors
 * #090C08
 * #474056
 * #62A8AC
 * #5497A7
 * #50858B
 */
main()