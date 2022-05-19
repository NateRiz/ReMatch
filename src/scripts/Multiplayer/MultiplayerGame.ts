import Player from "./Player"
import RuleGenerator from "../RuleGenerator"
import Settings from "./Settings"

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
    settings: Settings | undefined;

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

    OnStartGame(settings: Settings){
        this.settings = settings
        localStorage.setItem("Settings", JSON.stringify(settings))

        this.hiddenInput.disabled = false;
        const settingsPanel = document.querySelector("#SettingsContainer") as HTMLDivElement;
        settingsPanel.parentElement?.removeChild(settingsPanel);

        this.players.forEach(player => {
            player.SetLives(settings.lives);
        });

        this.GetPlayerById(this.me)?.SetTeamChoiceUI(false)
        this.settings.UpdateWildCardUI();
    }

    OnPlayerConnect(playerInfo: object, settings: Settings){
        var player: Player = Object.setPrototypeOf(playerInfo, Player.prototype)
        player.settings = settings;
        this.players.push(player);
        player.CreatePlayerCard();
    }
    
    OnReceivePlayerList(players: object[], settings: Settings){
        this.players = []

        var playerContainer = document.querySelector("#PlayerContainer");
        var child = playerContainer?.lastElementChild;

        while (child){
            playerContainer?.removeChild(child);
            child = playerContainer?.lastElementChild;
        }

        players.forEach(player => this.OnPlayerConnect(player, settings));
    }

    OnPlayerDisconnect(peerId: string){
        this.RemovePlayer(peerId);
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
        this.ResetGuess();
    }

    OnOutOfTime(playerInfo: any){
        const player = this.GetPlayerById(playerInfo.playerId);
        if (!player){
            return;
        }

        this.UpdatePlayerLives(player, playerInfo.lives)
    }

    OnNextTurn(){
        this.ResetGuess();
    }

    OnReceiveRemainingLetters(playerInfo: any){
        const player = this.GetPlayerById(playerInfo.PlayerId);
        if (!player){
            return;
        }

        this.UpdatePlayerLives(player, playerInfo.Lives)

        if (player.id === this.me){
            player.UpdateRemainingCharacters(playerInfo.Letters)
        }
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
        const MaxNameWidth = 8;

        const gameDiv = document.querySelector("#PlayerContainer") as HTMLDivElement;
        gameDiv.classList.add("Hidden");    
        
        const resultDiv = document.querySelector("#ResultContainer") as HTMLDivElement;
        resultDiv.classList.remove("Hidden");

        var placeSpan = document.querySelector("#FirstPlace") as HTMLSpanElement;
        placeSpan.textContent = playerNames[0];
        if (playerNames[0].length >= MaxNameWidth){
            placeSpan.classList.add("ScrollableText")
        }
    
        placeSpan = document.querySelector("#SecondPlace") as HTMLSpanElement;
        placeSpan.textContent = playerNames[1];
        if (playerNames[1].length >= MaxNameWidth){
            placeSpan.classList.add("ScrollableText")
        }

        if (playerNames.length >= 3){
            document.querySelector("#ThirdPlaceContainer")?.classList.remove("Hidden");

            placeSpan = document.querySelector("#ThirdPlace") as HTMLSpanElement;
            placeSpan.textContent = playerNames[2];
            if (playerNames[2].length >= MaxNameWidth){
                placeSpan.classList.add("ScrollableText")
            }
        }
    }

    GetPlayerById(playerId: string): Player | undefined{
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
    ResetWord(difficulty: number, minimumMatches: number){
        this.rule = this.ruleGenerator._GetRule(difficulty, minimumMatches);
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

    private UpdatePlayerLives(player: Player, lives: number){
        player?.SetLives(lives);
        if(player && player.lives <= 0){
            this.RemovePlayer(player.id);
        }
    }

    private ResetGuess(){
        this.hiddenInput.value = '';
        this.guess = '';
        this.guessSpan.textContent = this.guess
    }
}