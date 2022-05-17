export default class Player{
    id: string = "";
    nickname: string = "";
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

    toJSON(){
        return {
            id: this.id,
            nickname: this.nickname,
        };
    }
}