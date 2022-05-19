export default class Settings{
    onSettingsChange: ()=>void;
    lives: number = 1;
    doesRulePersist: boolean = false;
    difficulty: number = 50;

    difficultyRange: HTMLInputElement;
    difficultySpan: HTMLSpanElement;
    rulePersists: HTMLInputElement;

    static noop = ()=>{};

    constructor(onSettingsChange: ()=>void = Settings.noop){
        this.onSettingsChange = onSettingsChange;
        this.difficultyRange = document.querySelector("#DifficultyRange") as HTMLInputElement;
        this.rulePersists = document.querySelector("#RulePersists") as HTMLInputElement;
        this.difficultySpan = document.querySelector("#DifficultyNumber") as HTMLSpanElement;

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

        this.difficultyRange.disabled = false;
        this.difficultyRange.oninput = () => {
            this.difficultySpan.textContent = this.difficultyRange.value;
        }
        this.difficultyRange.onchange = () => {
            this.difficulty = parseInt(this.difficultyRange.value);
            onSettingsChange();
        }

        this.rulePersists.disabled = false;
        this.rulePersists.onchange = () => {
            this.doesRulePersist = this.rulePersists.checked;
            onSettingsChange();
        }
    }

    public static CreateSettingsFromJSON(json: any){
        const settings = new Settings();
        Object.assign(settings, json);

        settings.SetLives(settings.lives);
        settings.SetDifficulty(settings.difficulty);
        settings.SetDoesRulePersist(settings.doesRulePersist)

        return settings;
    }

    toJSON(){
        return {
            lives: this.lives,
            difficulty: this.difficulty,
            doesRulePersist: this.doesRulePersist,
        };
    }

    public SetDifficulty(difficulty: number){
        this.difficulty = difficulty;
        this.difficultySpan.textContent = difficulty.toString();
        this.difficultyRange.value = difficulty.toString();
    }

    public SetDoesRulePersist(doesRulePersist: boolean){
        this.doesRulePersist = doesRulePersist;
        this.rulePersists.checked = doesRulePersist;
    }

    public SetLives(lives: number){
        this.lives = lives

        if(document.querySelector("#SettingsContainer") === null){
            return;
        }

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