export default class Settings{
    onSettingsChange: ()=>void;
    lives: number = 1
    static noop = ()=>{};

    constructor(onSettingsChange: ()=>void = Settings.noop){
        this.onSettingsChange = onSettingsChange;
        if(this.onSettingsChange === Settings.noop){
            return; // client
        }

        // Server
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

    public static CreateSettingsFromJSON(json: any){
        const settings = new Settings();
        Object.assign(settings, json);
        settings.SetLives(settings.lives);
        return settings;
    }

    toJSON(){
        return {
            lives: this.lives
        };
    }

    public SetLives(lives: number){
        this.lives = lives

        if(document.querySelector("#SettingsContainer") === null){
            return;
        }
        
        const twoButton = document.querySelector("#TwoLife") as HTMLImageElement;
        const threeButton = document.querySelector("#ThreeLife") as HTMLImageElement;

        twoButton?.src = '/src/assets/heart_empty.svg'
        threeButton?.src = '/src/assets/heart_empty.svg'

        if (lives >= 2){
            twoButton?.src = '/src/assets/heart_full.svg'
        }
        if (lives === 3){
            threeButton?.src = '/src/assets/heart_full.svg'
        }

        this.onSettingsChange();
    }
}