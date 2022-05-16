import ClassicGame from "./ClassicGame";

function main(){
    const classicGame  = new ClassicGame();
    const hiddenInput = (document.querySelector("#HiddenInput") as HTMLInputElement);

    hiddenInput.setAttribute('input-prev-val', '')
    hiddenInput.addEventListener('input', function(e){
        if(this.checkValidity()){
            hiddenInput.setAttribute('input-prev-val', this.value)
            classicGame.OnType();
        } else {
          this.value = hiddenInput.getAttribute('input-prev-val')!;
        }
    }); 

    window.addEventListener('keydown', (event) => { 
        hiddenInput.focus();

        const key = event.key.toLowerCase();
        if (key == "enter"){
            classicGame.SubmitGuess()
            return;
        }
    })
}

main()