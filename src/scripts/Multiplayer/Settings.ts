export default class Settings{
    onSettingsChange: ()=>void = ()=>{};
    lives: number = 1

    constructor(onSettingsChange: ()=>void){
        this.onSettingsChange = onSettingsChange;

        var OneLifeButton = document.querySelector("#OneLife") as HTMLButtonElement;
        OneLifeButton.onclick = () => {
            this.SetLives(1)
        }
        var TwoLifeButton = document.querySelector("#TwoLife") as HTMLImageElement;
        TwoLifeButton.onclick = () => {
            this.SetLives(2)
        }
        var ThreeLifeButton = document.querySelector("#ThreeLife") as HTMLImageElement;
        ThreeLifeButton.onclick = () => {
            this.SetLives(3)
        }
    }

    PopulateUI(){
        this.SetLives(this.lives);
    }

    toJSON(){
        return {
            lives: this.lives
        };
    }

    private SetLives(lives: number){
        this.lives = lives

        const twoButton = document.querySelector("#TwoLife") as HTMLImageElement;
        const threeButton = document.querySelector("#ThreeLife") as HTMLImageElement;

        twoButton.src = '/src/assets/heart_empty.svg'
        threeButton.src = '/src/assets/heart_empty.svg'

        if (lives >= 2){
            twoButton.src = '/src/assets/heart_full.svg'
        }
        if (lives === 3){
            threeButton.src = '/src/assets/heart_full.svg'
        }

        this.onSettingsChange();
    }
}