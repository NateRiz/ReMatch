import Drawable from './Drawable.js'
import RuleGenerator from './RuleGenerator.js'

export default class Game extends Drawable {
    constructor(){
        super()
        this.score = 0
        this.dictionary = new Set() // All possible words
        this.ruleGenerator = new RuleGenerator()
        this.rule = "R*match"
        this.ruleRegex = new RegExp(this.rule.replaceAll("*",".*"), "i");
        this.bonus = ""
        this.bonusRegex = new RegExp(this.bonus.replaceAll("*",".*"), "i");
        this.guess = ""
        this.canvas = document.querySelector("canvas")
        this.c = this.canvas.getContext("2d")
        this.lastWordIsError = false
        this.timer = null
        this.ResetTimer()
        fetch('./assets/dict.txt')
        .then(response => response.text())
        .then((data) => {
            var data = data.split("\n").map(e=>e.trim());
            data.forEach(element => {
                this.dictionary.add(element)
            });
            console.log("loaded dict")
        })

        this.Draw()
    }

    GuessLetter(event){
        const key = event.key.toLowerCase();

        if (key == "backspace"){
            this.guess = this.guess.slice(0,-1)
            return;
        } else if (key == "enter"){
            this.SubmitGuess()
            return;
        }

        if (key.length !== 1) {
            return;
        }
    
        const isLetter = (key >= "a" && key <= "z");
        if (!isLetter) {
            return
        }
        
        this.guess += key
    }

    SubmitGuess(){
        var isRuleCorrect = this.ruleRegex.test(this.guess)
        var isBonusCorrect = this.bonusRegex.test(this.guess)
        var isWordInDictionary = this.dictionary.has(this.guess)
        console.log(isRuleCorrect, isBonusCorrect, isWordInDictionary)
        this.lastWordIsError = !(isRuleCorrect && isWordInDictionary)
        if (this.lastWordIsError){
            this.guess = ""
        } else {
            this.ResetWord()
            this.score+=1
            this.ResetTimer()
        }
    }

    ResetWord(){
        this.rule = this.ruleGenerator._GetRule(Math.floor(this.score/10))
        this.bonus = this.rule
        this.ruleRegex = new RegExp(this.rule.replaceAll("*",".*").replaceAll("+", ".+"), "i");
        this.bonusRegex = new RegExp(this.bonus.replaceAll("*",".*").replaceAll("+", ".+"), "i");
        this.guess = ""
    }


    Draw() {
        // Draw Rule
        var fontSize = 42
        if (this.lastWordIsError){
            this.c.fillStyle = "red"
        } else {
            this.c.fillStyle = 'white';
        }
        this.c.font = `bold ${fontSize}px Monospace`
        var x = this.canvas.width / 2 - this.c.measureText(this.rule).width/2
        var y = fontSize
        this.c.fillText(this.rule, x, y)

        // Draw Bonus Rule
        x = this.canvas.width / 2 - this.c.measureText(this.bonus).width/2
        //this.c.fillText(this.bonus, x, y*2)
    
        // Draw Guess
        this.c.fillStyle = 'white';
        x = this.canvas.width / 2 - this.c.measureText(this.guess).width/2
        y = this.canvas.height / 2 - fontSize/2
        this.c.fillText(this.guess, x, y)

        // Draw Score
        var buffer = 16
        var text = "Score"
        x = this.canvas.width - buffer - this.c.measureText(text).width
        y = fontSize
        this.c.fillText(text, x, y)
        // Draw actual score number
        var score = this.score.toString()
        x = this.canvas.width - buffer - this.c.measureText(score).width
        y = fontSize * 2
        this.c.fillText(score, x, y)

        // Draw Rules
        text = "Rules"
        x = this.canvas.width - buffer - this.c.measureText(text).width
        y = fontSize * 4
        this.c.fillText(text, x, y)
        // Draw Actual Rules
        text = ["*", "*+", "*+|"][Math.min(Math.floor(this.score/10), 2)]
        x = this.canvas.width - buffer - this.c.measureText(text).width
        y = fontSize * 5
        this.c.fillText(text, x, y)
    }

    ResetTimer(){
        if (this.timer != null){
            window.clearTimeout(this.timer)
        }

        this.timer = window.setTimeout(()=>{alert("GG")}, 20000)
    }

};
