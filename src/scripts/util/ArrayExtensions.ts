interface Array<T> {
    count(o: T): number;
    getRandom(): T;
    shuffle(): Array<T>;
}

Array.prototype.count = function(obj: any){
    return this.filter((x: any) => x==obj).length;
}

Array.prototype.getRandom = function(){
    return this[Math.floor(Math.random() * this.length)] 
}

Array.prototype.shuffle = function(){
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
}