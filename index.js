function play(){
    document.querySelector("#PlayButton").style.display = "none";
    document.querySelector("#RestartButton").style.display = "initial";

    var canvas = new Canvas()    
    var game = new Game()
    canvas.SubscribeDrawableObject(game)
    
    window.addEventListener('keydown', (event) => { 
        game.GuessLetter(event)
        canvas.Redraw()
    })
    window.addEventListener('resize', () => {canvas.OnResizeWindow()}, true);
}

function main(){
    document.querySelector("#PlayButton").onclick = () => { play() }
    document.querySelector("#RestartButton").onclick = () => { play() }
}

main()