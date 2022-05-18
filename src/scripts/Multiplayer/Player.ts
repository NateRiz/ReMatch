export default class Player{
    id: string = "";
    nickname: string = "";
    abbreviatedNickname: string = "";
    place = 999; // Whichever place this player came in. (first, second...)
    playerCard: HTMLDivElement | undefined;

    constructor(id: string, nickname: string){
        this.id = id;
        this.nickname = nickname;
    }

    public SelectPlayerCard(){
        this.playerCard?.classList.remove("PlayerTemplateIdle");
        this.playerCard?.classList.add("PlayerTemplateSelected");

        this.playerCard?.children[0].classList.remove("PlayerIdle");
        this.playerCard?.children[0].classList.add("PlayerSelected");
    }

    public DeselectPlayerCard(){
        this.playerCard?.classList.remove("PlayerTemplateSelected");
        this.playerCard?.classList.add("PlayerTemplateIdle");
        
        this.playerCard?.children[0].classList.remove("PlayerSelected");
        this.playerCard?.children[0].classList.add("PlayerIdle");
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
        this.playerCard = clone.childNodes[1] as HTMLDivElement;

        (this.playerCard.childNodes[1] as HTMLSpanElement).textContent = this.abbreviatedNickname;
        playerContainer?.appendChild(clone);
    }

    toJSON(){
        return {
            id: this.id,
            nickname: this.nickname,
        };
    }
}