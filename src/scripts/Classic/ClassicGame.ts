import RuleGenerator from "../RuleGenerator";

export default class ClassicGame{
    score: number;
    dictionary: Set<string>;
    ruleGenerator: RuleGenerator;
    rule: string;
    ruleRegex: RegExp;
    guess: string;
    lastWordIsError: boolean;
    timer: number | null;
    guessSpan: HTMLSpanElement;
    ruleSpan: HTMLSpanElement;
    scoreSpan: HTMLSpanElement;
    availableRulesSpan: HTMLSpanElement;
    hiddenInput: HTMLInputElement;

    constructor(){
        this.score = 0
        this.dictionary = new Set() // All possible words
        this.ruleGenerator = new RuleGenerator()
        this.rule = "R*match"
        this.ruleRegex = new RegExp(this.rule.replaceAll("*",".*"), "i");
        this.guess = ""
        this.lastWordIsError = false
        this.timer = null
        this.guessSpan = (document.querySelector("#Guess") as HTMLSpanElement)
        this.ruleSpan = (document.querySelector("#Rule") as HTMLSpanElement);
        this.scoreSpan = (document.querySelector("#Score") as HTMLSpanElement);
        this.availableRulesSpan = (document.querySelector("#AvailableRules") as HTMLSpanElement);
        this.hiddenInput = (document.querySelector("#HiddenInput") as HTMLInputElement);
        this.ResetTimer()
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

    OnType(){        
        this.guess = this.hiddenInput.value;
        this.guessSpan.textContent = this.guess;
    }

    SubmitGuess(){
        const guess = this.guess.toLowerCase();
        var isRuleCorrect = this.ruleRegex.test(guess)
        var isWordInDictionary = this.dictionary.has(guess)
        console.log(isRuleCorrect, isWordInDictionary)
        this.lastWordIsError = !(isRuleCorrect && isWordInDictionary)
        if (this.lastWordIsError){
            this.guess = ""
        } else {
            this.ResetWord()
            this.score+=1
            this.scoreSpan.textContent = this.score.toString();
            this.ResetTimer()
        }
    }

    ResetWord(){
        this.rule = this.ruleGenerator._GetRule(Math.floor(this.score/10))
        this.ruleSpan.textContent = this.rule
        this.ruleRegex = new RegExp(this.rule.replaceAll("*",".*").replaceAll("+", ".+"), "i");
        this.guess = "";
        this.guessSpan.textContent = this.guess;
        this.hiddenInput.value = "";
    }

    ResetTimer(){
        const duration = 20000;
        if (this.timer != null){
            window.clearTimeout(this.timer)
        }

        var timerElement = document.body;
        
        timerElement.classList.remove("Timer");
        window.setTimeout(()=>timerElement.classList.add("Timer"), 1);

        timerElement.style.animationDuration = Math.floor(duration / 1000).toString() +"s";

        this.timer = window.setTimeout(()=>{alert("GG")}, duration)

    }

};
