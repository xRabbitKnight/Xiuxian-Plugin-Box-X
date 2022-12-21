import RandomEvent  from "./RandomEvent.js";

export default class BattleVictory{
    constructor(){
        if(!BattleVictory.instance) BattleVictory.instance = this;
        return BattleVictory.instance;
    };

    eventList = [
        AddLargeExp, 
        AddMediumExp,
        AddLessExp,
    ];

    TriggerEvent(_user, _monster, _msg){
        const MaxCount = 5;
        for(let i = 0, done = false; i < MaxCount && !done; ++i){
            const event = this.eventList[Math.floor(Math.random() * this.eventList.length)];
            done = Math.random() < event.odds;
            if(done) event.fnc(_user, _monster, _msg);
        }
    }
}

const AddLargeExp = new RandomEvent({
    odds : 0.05,
    fnc : (_user, _monster, _msg) =>{
        const exp = Math.floor(Math.random() * 1000 * _monster.level);
        _msg.push(`击杀${_monster.name}后，你发现了一颗完整的内丹，服下后你的修为提升了${exp}！！`);
        await Add_experience(_user.user_id, exp);
    }
});

const AddMediumExp = new RandomEvent({
    odds : 0.10,
    fnc : (_user, _monster, _msg) =>{
        const exp = Math.floor(Math.random() * 100 * _monster.level);
        _msg.push(`击杀${_monster.name}后，你发现了怪物的内丹被拍碎了，只剩下一颗残破的内丹，服下后你的修为提升了${exp}！`);
        await Add_experience(_user.user_id, exp);
    }
});

const AddLessExp = new RandomEvent({
    odds : 0.30,
    fnc : (_user, _monster, _msg) =>{
        const exp = Math.floor(Math.random() * 10 * _monster.level);
        _msg.push(`击杀${_monster.name}后，你发现了怪物的内丹被你拍得粉碎，只剩下一些碎渣，勉强服下后你的修为提升了${exp}.`);
        await Add_experience(_user.user_id, exp);
    }
});