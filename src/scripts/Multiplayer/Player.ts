export default class Player{
    id: string = "";
    nickname: string = "";
    abbreviatedNickname: string = "";
    lives: number = 0;
    place = 999; // Whichever place this player came in. (first, second...)
    playerCard: HTMLDivElement | undefined;
    playerNameSpan: HTMLSpanElement | undefined

    constructor(id: string, nickname: string){
        this.id = id;
        this.nickname = nickname;
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

    toJSON(){
        return {
            id: this.id,
            nickname: this.nickname,
        };
    }
}