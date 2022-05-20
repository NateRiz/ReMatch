export default class PlayerButton{
    recipient: string;
    cost: number;
    imageName: string;
    backgroundColor: string;
    style: string;

    constructor(recipient:string, cost:number, imageName: string, backgroundColor: string, style:string=""){
        this.recipient = recipient;
        this.cost = cost;
        this.imageName = imageName;
        this.backgroundColor = backgroundColor
        this.style = style
    }
}