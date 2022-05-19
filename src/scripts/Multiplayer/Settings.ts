export default class Settings{
    onSettingsChange: ()=>void;
    lives: number = 1;
    doesRulePersist: boolean = false;
    difficulty: number = 50;
    teams: boolean = false;

    difficultyInput: HTMLInputElement;
    difficultySpan: HTMLSpanElement;
    rulePersistsInput: HTMLInputElement;
    teamsInput: HTMLInputElement;

    static noop = ()=>{};

    constructor(onSettingsChange: ()=>void = Settings.noop){
        this.onSettingsChange = onSettingsChange;
        this.difficultyInput = document.querySelector("#DifficultyRange") as HTMLInputElement;
        this.rulePersistsInput = document.querySelector("#RulePersists") as HTMLInputElement;
        this.difficultySpan = document.querySelector("#DifficultyNumber") as HTMLSpanElement;
        this.teamsInput = document.querySelector("#Teams") as HTMLInputElement;

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

        this.difficultyInput.disabled = false;
        this.difficultyInput.oninput = () => {
            this.difficultySpan.textContent = this.difficultyInput.value;
        }
        this.difficultyInput.onchange = () => {
            this.difficulty = parseInt(this.difficultyInput.value);
            onSettingsChange();
        }

        this.rulePersistsInput.disabled = false;
        this.rulePersistsInput.onchange = () => {
            this.doesRulePersist = this.rulePersistsInput.checked;
            onSettingsChange();
        }

        this.teamsInput.disabled = false;
        this.teamsInput.onchange = () => {
            this.teams = this.teamsInput.checked;
            onSettingsChange();
        }
    }

    public static CreateSettingsFromJSON(json: any){
        const settings = new Settings();
        Object.assign(settings, json);

        settings.SetLives(settings.lives);
        settings.SetDifficulty(settings.difficulty);
        settings.SetDoesRulePersist(settings.doesRulePersist)
        settings.SetTeams(settings.teams);

        return settings;
    }

    toJSON(){
        return {
            lives: this.lives,
            difficulty: this.difficulty,
            doesRulePersist: this.doesRulePersist,
            teams: this.teams,
        };
    }

    public SetDifficulty(difficulty: number){
        this.difficulty = difficulty;

        if(this.IsSettingsPaneGone()){
            return;
        }

        this.difficultySpan.textContent = difficulty.toString();
        this.difficultyInput.value = difficulty.toString();
    }

    public SetDoesRulePersist(doesRulePersist: boolean){
        this.doesRulePersist = doesRulePersist;

        if(this.IsSettingsPaneGone()){
            return;
        }

        this.rulePersistsInput.checked = doesRulePersist;
    }

    public SetTeams(teams: boolean){
        this.teams = teams;

        if(this.IsSettingsPaneGone()){
            return;
        }

        this.teamsInput.checked = teams;
    }

    public SetLives(lives: number){
        this.lives = lives

        if(this.IsSettingsPaneGone()){
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

    private IsSettingsPaneGone(){
        return document.querySelector("#SettingsContainer") === null
    }
}