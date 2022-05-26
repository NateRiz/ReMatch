import RuleGenerator from "../RuleGenerator";

export default class ClassicGame{
    score: number;
    dictionary: Set<string>;
    ruleGenerator: RuleGenerator;
    rule: string;
    ruleRegex: RegExp;
    guess: string;
    lastWordIsError: boolean;
    isMobile: boolean = false;
    timer: number | null;
    timerInterval: NodeJS.Timer | undefined;
    guessSpan: HTMLSpanElement;
    ruleSpan: HTMLSpanElement;
    scoreSpan: HTMLSpanElement;
    availableRulesSpan: HTMLSpanElement;
    hiddenInput: HTMLInputElement;
    mobileGuess: HTMLInputElement;
    timerSpan: HTMLSpanElement;


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
        this.mobileGuess = (document.querySelector("#MobileGuess") as HTMLInputElement);
        this.timerSpan = document.querySelector("#TimerText") as HTMLSpanElement;
        this.isMobile = this.IsMobile();
        this.ResetTimer()
        fetch('./assets/dict.txt')
        .then(response => response.text())
        .then((data) => {
            var words = data.split("\n").map(e=>e.trim());
            words.forEach(element => {
                this.dictionary.add(element)
            });
            console.log("loaded dict")
        });

        (document.querySelector("#Restart")as HTMLButtonElement).onclick = () => location.reload();
        this.SetupUI();
    }

    OnType(){       
        if (this.isMobile){
            this.guess = this.mobileGuess.value;
        } else {
            this.guess = this.hiddenInput.value;
            this.guessSpan.textContent = this.guess;
        }
    }

    SubmitGuess(){
        const guess = this.guess.toLowerCase();
        var isRuleCorrect = this.ruleRegex.test(guess)
        var isWordInDictionary = this.dictionary.has(guess)
        console.log(isRuleCorrect, isWordInDictionary)
        this.lastWordIsError = !(isRuleCorrect && isWordInDictionary)
        if (this.lastWordIsError){
            // this.guess = "" ???
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
        this.ruleRegex = new RegExp('^'+this.rule.replaceAll("*",".*").replaceAll("+", ".+")+'$', "i");
        this.guess = "";
        this.guessSpan.textContent = "";
        this.mobileGuess.value = "";
        this.hiddenInput.value = "";
    }

    EndGame(){
        this.hiddenInput.disabled = true;

        this.mobileGuess.classList.add("Hidden")

        const guessContainer = document.querySelector("#GuessContainer") as HTMLDivElement;
        guessContainer.classList.add("Hidden");

        const resultContainer = document.querySelector("#ResultContainer") as HTMLDivElement;
        resultContainer.classList.remove("Hidden")

        const finalScore = document.querySelector("#FinalScore") as HTMLSpanElement;
        finalScore.textContent = this.score.toString();

        const highScore = localStorage.getItem("Highscore") || "0";
        const highScoreSpan = document.querySelector("#Highscore") as HTMLSpanElement;
        highScoreSpan.textContent = `High Score ${Math.max(parseInt(highScore), this.score)}`;

        if(this.score > parseInt(highScore)){
            const newHighScore = document.querySelector("#NewHighScore") as HTMLDivElement;
            newHighScore.classList.remove("Hidden");
            localStorage.setItem("Highscore", this.score.toString());
        }
    }

    ResetTimer(){
        const duration = 20000;
        if (this.timer != null){
            window.clearTimeout(this.timer)
        }

        if(this.timerInterval){
            clearInterval(this.timerInterval);
        }
        this.timerInterval = setInterval(()=>{
            this.timerSpan.textContent = (Math.max(0,parseInt(this.timerSpan.textContent || '0')-1)).toString()
        }, 1000)

        var timerElement = document.body;
        
        timerElement.classList.remove("Timer");
        window.setTimeout(()=>timerElement.classList.add("Timer"), 1);

        timerElement.style.animationDuration = Math.floor(duration / 1000).toString() +"s";

        this.timer = window.setTimeout(()=>{this.EndGame()}, duration)
    }

    IsMobile(){
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(window as any).opera);
        return check;
    }

    SetupUI(){
        if (this.isMobile){
            this.SetupMobileUI();
        }else{
            this.SetupDesktopUI();
        }
    }

    SetupDesktopUI(){
        this.guessSpan.classList.remove("Hidden")
        const self = this;
        const hiddenInput = (document.querySelector("#HiddenInput") as HTMLInputElement);
        hiddenInput.setAttribute('input-prev-val', '')
        hiddenInput.addEventListener('input', function(e){
            if(this.checkValidity()){
                hiddenInput.setAttribute('input-prev-val', this.value)
                self.OnType();
            } else {
              this.value = hiddenInput.getAttribute('input-prev-val')!;
            }
        }); 
    
        window.addEventListener('keydown', (event) => { 
            hiddenInput.focus();
    
            const key = event.key.toLowerCase();
            if (key == "enter"){
                self.SubmitGuess()
                return;
            }
        });
    }

    SetupMobileUI(){
        const self = this;
        this.mobileGuess.classList.remove("Hidden")
        this.mobileGuess.setAttribute('input-prev-val', '')
        this.mobileGuess.addEventListener('input', function(e){
            if(this.checkValidity()){
                self.mobileGuess.setAttribute('input-prev-val', this.value)
                self.OnType();
            } else {
              this.value = self.mobileGuess.getAttribute('input-prev-val')!;
            }
        }); 
        window.addEventListener('keydown', (event) => { 
    
            const key = event.key.toLowerCase();
            if (key == "enter"){
                self.SubmitGuess()
                return;
            }
        });
    }
};
