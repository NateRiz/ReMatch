export default class PlayerButton{
    recipient: string;
    cost: number;

    constructor(recipient:string, cost:number){
        this.recipient = recipient;
        this.cost = cost;
    }
}