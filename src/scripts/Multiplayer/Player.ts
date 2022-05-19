import Settings from "./Settings";

export default class Player{
    settings: Settings | undefined;
    id: string = "";
    nickname: string = "";
    abbreviatedNickname: string = "";
    lives: number = 0;
    lastRule: string = "";
    team: number = -1;
    place = 999; // Whichever place this player came in. (first, second...)
    playerCard: HTMLDivElement | undefined;
    playerNameSpan: HTMLSpanElement | undefined;
    TeamChoiceContainer: HTMLDivElement | undefined;
    remainingCharacters = new Set('qwertyuiopasdfghjklzxcvbnnm')

    constructor(id: string, nickname: string, team: number){
        this.id = id;
        this.nickname = nickname;
        this.team = team;
    }

    public SelectPlayerCard(){
        this.playerCard?.classList.remove("PlayerTemplateIdle");
        this.playerCard?.classList.add("PlayerTemplateSelected");

        this.playerNameSpan?.classList.remove("PlayerIdle");
        this.playerNameSpan?.classList.add("PlayerSelected");
    }

    public DeselectPlayerCard(){
        this.playerCard?.classList.remove("PlayerTemplateSelected");
        this.playerCard?.classList.add("PlayerTemplateIdle");
        
        this.playerNameSpan?.classList.remove("PlayerSelected");
        this.playerNameSpan?.classList.add("PlayerIdle");
    }

    public RemovePlayer(){
        this.playerCard?.parentNode?.removeChild(this.playerCard);
    }

    public CreatePlayerCard(){
        this.abbreviatedNickname = this.nickname;
        const MaxNameWidth = 11
        if (this.nickname.length > MaxNameWidth - 2){
            this.abbreviatedNickname = this.nickname.slice(0, MaxNameWidth-2) + "..";
        }

        var template = document.querySelector("#PlayerTemplate") as HTMLTemplateElement;
        var playerContainer = document.querySelector("#PlayerContainer");

        var clone = template.content.cloneNode(true);
        playerContainer?.appendChild(clone);

        this.playerCard = playerContainer?.lastElementChild as HTMLDivElement;
        this.playerNameSpan = this.playerCard.querySelector(".PlayerSpan") as HTMLSpanElement;
        this.playerNameSpan.textContent = this.abbreviatedNickname;

        this.TeamChoiceContainer = this.playerCard.querySelector(".TeamChoiceContainer") as HTMLDivElement;
    
        if (this.settings?.teams){
            this.SetTeam(this.team);
        }
    }

    public SetLives(lives: number) {
        this.lives = lives

        const lifeContainer = this.playerCard?.querySelector("#PlayerLivesContainer") as HTMLDivElement;
        var child = lifeContainer?.lastElementChild;
        while (child){
            lifeContainer?.removeChild(child);
            child = lifeContainer?.lastElementChild;
        }

        var template = document.querySelector("#LifeTemplate") as HTMLTemplateElement;

        for(var i = 0; i < lives; i++){
            var clone = template.content.cloneNode(true);
            lifeContainer?.appendChild(clone);
        }
    }

    public DecrementLives(){
        this.SetLives(this.lives - 1);
    }

    public IncrementLives(){
        this.SetLives(this.lives + 1);
    }

    public CheckAndUpdateTeamUI(){
        if (this.settings?.teams){
            this.HighlightTeamChoice();
        }
    }

    public ToggleTeamChoiceUI(){
        this.SetTeamChoiceUI(this.settings!.teams);
    }

    public SetTeamChoiceUI(isEnabled: boolean){
        if (isEnabled){
            this.TeamChoiceContainer?.classList.remove("Hidden")
        }else{
            this.TeamChoiceContainer?.classList.add("Hidden")
            document.querySelectorAll(".PlayerTemplate").forEach((playerCard) => {
                (playerCard as HTMLDivElement).style.borderColor = "transparent";
            })
        }
    }


    public SetTeam(team: number){
        this.team = team;
        this.HighlightTeamChoice();
    }

    public RemoveLetters(guess: string){
        //Remove used letters from guess. Return true if the user used all letters.
        Array.from(guess).forEach((c)=>this.remainingCharacters.delete(c));
        if (this.remainingCharacters.size === 0){
            this.remainingCharacters = new Set('qwertyuiopasdfghjklzxcvbnnm');
            return true;
        }
        return false;
    }

    UpdateRemainingCharacters(letters: string){
        this.remainingCharacters = new Set(letters);
        document.querySelectorAll(".Letter").forEach((letterSpan)=>{
            letterSpan.classList.remove("UsedLetter")
            letterSpan.classList.add("UnusedLetter")

            var letter = letterSpan.textContent?.toLowerCase() || '';
            if(!this.remainingCharacters.has(letter)){
                letterSpan.classList.remove("UnusedLetter");
                letterSpan.classList.add("UsedLetter");
            }
        });

    }

    toJSON(){
        return {
            id: this.id,
            nickname: this.nickname,
            team: this.team,
        };
    }

    private HighlightTeamChoice(){
        Array.from(this.TeamChoiceContainer?.children!).forEach((child)=>{
            child.classList.remove('TeamChoiceSelected')
        })
        this.TeamChoiceContainer?.children[this.team].classList.add("TeamChoiceSelected");

        this.playerCard!.style.borderColor = window.getComputedStyle(this.TeamChoiceContainer!.children[this.team] as HTMLSpanElement).backgroundColor;
    }
}