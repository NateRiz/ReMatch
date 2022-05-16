export default class RuleGenerator{
    dictionary: Set<string>;
    wordList: Array<string>;

    constructor(){
        this.dictionary = new Set();
        this.wordList = [];
        fetch('./src/assets/10kdict_common_words.txt') // Only gen rules based on common words
        .then(response => response.text())
        .then((data) => {
            var words = data.split("\n").map(e=>e.trim());
            words.forEach(element => {
                this.dictionary.add(element)
            });
        })
    }

    _GetRule(difficulty: number){
        var startTime = performance.now()
        var word = this.GetRule(difficulty)
        console.log(`Time: ${performance.now() - startTime}`)
        return word
    }

    GetRule(difficulty: number){
        this.CacheWordsIfEmpty()

        var ruleBuilder = new RuleBuilder()
        var rules = [
            //this.RuleAlphaBetSubset
        ]
        if (difficulty >= 2){
            rules.push((_build: Array<string>) => {return ruleBuilder.RuleOr(_build)})
        }

        if (difficulty >= 1){
            rules.push((_build: Array<string>) => {return ruleBuilder.RulePlus(_build)})
        }

        if (difficulty >= 0){
            rules.push((_build: Array<string>) => {return ruleBuilder.RuleStar(_build)})
        }

        
        var numberOfMatches = 0
        var build = this.GetRandomWord()
        var newWord = ''
        while (numberOfMatches < 50){

            //Don't get to the point where there are <= 2 letters left in a word
            var numAvailableIndices = RuleBuilder.GetLetterIndices(build).length
            if (numAvailableIndices <= 2){
                build = this.GetRandomWord()
            }

            // Iterate through all rules trying to apply one
            rules.shuffle()
            var isRuleAltered = false;
            for(var i = 0; i < rules.length; i++){
                var rule = rules[i]
                isRuleAltered = rule(build)
                if (isRuleAltered){
                    break
                }
            }
            
            // If no rules were able to change the word, trash it and get a new one.
            if (!isRuleAltered){
                build = this.GetRandomWord()
                continue
            }

            newWord = build.join('')
            var regex = this.ConvertToRegex(newWord)
            numberOfMatches = this.GetNumberOfMatches(regex)
        }

        return newWord
    }

    GetRandomWord(){
        // Get Word length >= 5
        var word = "";
        while (!this.IsValidWord(word)){
            word = this.wordList.getRandom();
            console.log(word);
        }

        return Array.from(word)
    }

    IsValidWord(word: string){
        const minWordLength = 5;
        if (word.length < minWordLength){
            return false;
        }

        return true;
    }

    GetNumberOfMatches(word: string){
        var count = 0
        var regExp = new RegExp(word)
        this.dictionary.forEach( word => {
            count += +regExp.test(word)
        });

        return count
    }

    CacheWordsIfEmpty(){
        this.wordList = Array.from(this.dictionary);
    }

    ConvertToRegex(word: string){
        return word.replace("*", ".*").replace("+",".+")
    }
}

class RuleBuilder{
    static MAX_WILDCARDS = 2
    constructor(){}

    // ex: .*can => pecan (or just can)
    // testing: *testing, *esting, test*ng, test*ing, testin*, testing*
    RuleStar(build: Array<string>){
        return this._RuleWildCard(build, "*")
    }

    // star.+ => stare
    RulePlus(build: Array<string>){
        return this._RuleWildCard(build, "+")
    }

    _RuleWildCard(build: Array<string>, wildcard: string){
        var availableIndices = RuleBuilder.GetLetterIndices(build)
        var numWildcards = this._GetNumberOfWildCards(build)

        if(numWildcards >= RuleBuilder.MAX_WILDCARDS){
            var filteredAvailableIndices = []
            const wildcards = ["*", "+"]
            for(var i = 0; i < availableIndices.length; i++){
                if ((availableIndices[i] > 0 && wildcards.includes(build[availableIndices[i]-1])) || (availableIndices[i] < availableIndices.length && wildcards.includes(build[availableIndices[i]+1]))){
                    filteredAvailableIndices.push(availableIndices[i])
                }
            }

            availableIndices = filteredAvailableIndices
        }

        if (availableIndices.length === 0){
            return false;
        }

        var idx = availableIndices.getRandom()
        build[idx] = wildcard
        this._CleanRule(build)
        return true
    }

    // ex: (h|j)orrible => horrible
    RuleOr(build: Array<string>){
        if(this._GetNumberOfOr(build) > 0){
            return false
        }
        
        var availableIndices = RuleBuilder.GetLetterIndices(build)
        var idx = availableIndices.getRandom()
        var chr = build[idx]
        var letters = []
        if (this._IsVowel(chr)){
            letters = Array.from("aeiou")
            letters.splice(letters.indexOf(chr), 1)
        } else {
            letters = Array.from("qwrtyplkjhgfdszxcvbnm")
            letters.splice(letters.indexOf(chr), 1)
        }
        var randChar = letters.getRandom()
        if (Math.floor(Math.random() * 2) == 0){
            [chr, randChar] = [randChar, chr]
        }
        var rule = `(${chr}|${randChar})`
        build[idx] = rule
        return true

    }

    // ex: [a-k]ello => (hello) 
    RuleAlphabetSubset(build: Array<string>){
        return false
    }


    static GetLetterIndices(build: Array<string>){
        var availableIndices = []
        for(var i = 0; i < build.length; i++){
            if (build[i].length == 1 && 'a' <= build[i] && build[i] <= 'z'){
                availableIndices.push(i)
            }
        }

        return availableIndices
    }

    _GetNumberOfWildCards(build: Array<string>){
        return build.count("*") + build.count("+")
    }

    _GetNumberOfOr(build: Array<string>){
        var c = 0
        build.forEach((elem: string)=> {
            if (elem.includes("|")){
                c+=1
            }
        })
        return c
    }

    _CleanRule(build: Array<string>){
        var i = 0;
        while (i < build.length - 1){
            if ((build[i]=="*" && build[i+1]=="+") || (build[i]=="+" && build[i+1]=="*")){
                build[i]="+"
                build.splice(i+1, 1)
            } else if (build[i] == build[i+1] && this._IsWildcard(build[i])) {
                build.splice(i+1, 1)
            } else{
                i+=1
            }
        }
    }

    _IsWildcard(chr: string) {
        return chr == "*" || chr == "+"
    }

    _IsVowel(c: string) {
        if(c == undefined){debugger}
        return ['a', 'e', 'i', 'o', 'u'].indexOf(c.toLowerCase()) !== -1
    }
}
