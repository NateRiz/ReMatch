export default class Cookies{
    constructor(){
    }

    public static SetNickName(){
        var name = Cookies.GetNickName();
        (document.querySelector("#NickName") as HTMLInputElement).value = name;
    }
    
    public static SaveNickName(nickname: string){
        if (nickname.length > 0){
            window.localStorage.setItem("nickname", nickname)
        }
    }
    
    public static GetNickName(){
        var nickname = window.localStorage.getItem("nickname");
        if (nickname !== null){
            return nickname;
        }
    
        nickname = "Guest" + (Math.floor(Math.random()*8998) + 1000).toString();
        Cookies.SaveNickName(nickname);
        return nickname;
    }

}