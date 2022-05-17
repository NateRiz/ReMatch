import Player from "./Player"
import RuleGenerator from "../RuleGenerator"

export default class MultiplayerGame{
    players: Player[] = [] // All player ids
    turn: number = 0 // player's id for whoever's turn it is
    round: number = 0
    me: string = "" // This player's peer id
    ruleGenerator: RuleGenerator
    rule: string = ""
    guess: string = ""
    ruleRegex: RegExp
    dictionary: Set<string>;

    hiddenInput: HTMLInputElement;
    ruleSpan: HTMLSpanElement;
    guessSpan: HTMLSpanElement;
    roundSpan: HTMLSpanElement;

    constructor(){
        this.ruleGenerator = new RuleGenerator()
        this.ruleRegex = new RegExp(".*")
        this.dictionary = new Set();
        this.hiddenInput = document.querySelector("#HiddenInput") as HTMLInputElement;
        this.ruleSpan = document.querySelector("#Rule") as HTMLSpanElement;
        this.guessSpan = document.querySelector("#Guess") as HTMLSpanElement;
        this.roundSpan = document.querySelector("#Round") as HTMLSpanElement;
        
        fetch('./src/assets/dict.txt')
        .then(response => response.text())
        .then((data) => {
            var words = data.split("\n").map(e=>e.trim());
            words.forEach(element => {
                this.dictionary.add(element)
            });
            console.log("loaded dict")
        })
    }

    OnStartGame(){
        this.hiddenInput.disabled = false;
    }

    OnPlayerConnect(allPlayers: object[]){
        this.players = Array.from(allPlayers, (p) => Object.setPrototypeOf(p, Player.prototype));
        var playerContainer = document.querySelector("#PlayerContainer");
        var child = playerContainer?.lastElementChild
        while (child){
            playerContainer?.removeChild(child);
            child = playerContainer?.lastElementChild;
        }

        var template = document.querySelector("#PlayerTemplate") as HTMLTemplateElement;
        this.players.forEach((player) => {
            var clone = template.content.cloneNode(true);
            player.playerCard = clone.childNodes[1] as HTMLDivElement;
            (player.playerCard.childNodes[1] as HTMLSpanElement).textContent = player.nickname;
            playerContainer?.appendChild(clone);
        });

    }

    OnCreateMyClientCallback(me: string){
        this.me = me
    }

    OnReceiveRule(rule: string){
        this.rule = rule
        this.ruleSpan.textContent = this.rule;
    }

    OnReceiveTurnOrder(playerIds: string[]){
        this.players.sort((a, b) => +(playerIds.indexOf(a.id) < playerIds.indexOf(b.id)));
    }

    OnReceiveTurn(playerTurn: number){
        this.turn = playerTurn;
        this.players.forEach((player) => {
            player.DeselectPlayerCard();
        })

        this.players[playerTurn].SelectPlayerCard()

        if (this.turn === 0){
            this.round += 1
            this.roundSpan.textContent = this.round.toString()
        }

        this.ResetTimer();
    }

    OnGuessUpdate(value: string){
        this.guess = value
        this.guessSpan.textContent = this.guess
    }

    OnCorrectGuess(){
        this.hiddenInput.value = '';
        this.guess = '';
        this.guessSpan.textContent = this.guess
    }

    RemovePlayer(playerId: string){
        const index = this.players.findIndex(p => {
            return p.id === playerId;
        });

        if (index !== -1){
            this.players[index].RemovePlayer();
            this.players.splice(index, 1);
        }
    }

    EndGame(playerNames: string[]){
        this.hiddenInput.disabled = true;

        
        const gameDiv = document.querySelector("#PlayerContainer") as HTMLDivElement;
        gameDiv.classList.add("Hidden");    
        
        const resultDiv = document.querySelector("#ResultContainer") as HTMLDivElement;
        resultDiv.classList.remove("Hidden");

        var placeSpan = document.querySelector("#FirstPlace") as HTMLSpanElement;
        placeSpan.textContent = playerNames[0];
    
        placeSpan = document.querySelector("#SecondPlace") as HTMLSpanElement;
        placeSpan.textContent = playerNames[1];

        if (playerNames.length >= 3){
            document.querySelector("#ThirdPlaceContainer")?.classList.remove("Hidden");

            placeSpan = document.querySelector("#ThirdPlace") as HTMLSpanElement;
            placeSpan.textContent = playerNames[2];
        }
    }

    GetPlayerById(playerId: string): Player{
        const index = this.players.findIndex(p => {
            return p.id === playerId;
        });

        return this.players[index];
    }

    IsMyTurn(){
        return this.IsPlayersTurn(this.me);
    }

    IsPlayersTurn(player: string){
        return player === this.players[this.turn].id;
    }

    TestGuess(guess: string){
        var isRuleCorrect = this.ruleRegex.test(guess)
        var isWordInDictionary = this.dictionary.has(guess)
        console.log(isRuleCorrect, isWordInDictionary)
        var lastWordIsError = !(isRuleCorrect && isWordInDictionary)
        if (lastWordIsError){
            // this.guess = ""
        } else {
            // this.ResetWord()
            // this.score+=1
            // this.ResetTimer()
        }
        return isRuleCorrect && isWordInDictionary;
    }

    // ### Server Only Functions ###
    ResetWord(){
        this.rule = this.ruleGenerator._GetRule(1);
        this.ruleRegex = new RegExp(this.rule.replaceAll("*",".*").replaceAll("+", ".+"), "i");
        this.guess = "";
        this.guessSpan.textContent = this.guess;
    }

    // Used after a player is removed from the game to re-sync turn order
    DecrementTurn(){
        this.turn -= 1
    }

    IncrementTurn(){
        this.turn = (this.turn + 1) % this.players.length;
    }
    // ### End Server Only Functions ###

    private ResetTimer(){
        const duration = 20000;

        var timerElement = document.body;
        
        timerElement.classList.remove("Timer");
        window.setTimeout(()=>timerElement.classList.add("Timer"), 50);

        timerElement.style.animationDuration = Math.floor(duration / 1000).toString() +"s";
    }
}