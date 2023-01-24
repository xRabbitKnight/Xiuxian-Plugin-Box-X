import RandomEvent from "./RandomEvent.js";
import { rand, clamp } from '../util/math.js'
import { AddPowerByEvent } from '../Cache/player/Battle.js';
import { AddExp, AddBodyExp } from '../Cache/player/Level.js';
import { AddItemByObj, AddSpiritStone } from '../Cache/player/Backpack.js';
import { GetAllItem } from '../Cache/item/Item.js';

const MaxLevel = 10;    //目前掉落物品的最高最低等级
const MinLevel = 0;
//----------------------------------------------------随机事件区

//增加大量修为
const addLargeExp = new RandomEvent({
    odds: 0.10,
    fnc: async (_e, _monster, _msg) => {
        const exp = rand(700, 1000) * _monster.level;
        _msg.push(`击杀${_monster.name}后，你发现了一颗完整的内丹，服下后你的修为提升了${exp}！！`);
        AddExp(_e.user_id, exp);
    }
});

//增加中量修为
const addMediumExp = new RandomEvent({
    odds: 0.20,
    fnc: async (_e, _monster, _msg) => {
        const exp = rand(200, 500) * _monster.level;
        _msg.push(`击杀${_monster.name}后，你发现了怪物的内丹被拍碎了，只剩下一颗残破的内丹，服下后你的修为提升了${exp}！`);
        AddExp(_e.user_id, exp);
    }
});

//增加大量气血
const addLargeExpHP = new RandomEvent({
    odds: 0.10,
    fnc: async (_e, _monster, _msg) => {
        const expHP = rand(700, 1000) * _monster.level;
        _msg.push(`击杀${_monster.name}后，你提炼出一瓶高品质精血，服下后你的气血提升了${expHP}！！`);
        AddBodyExp(_e.user_id, expHP);
    }
});

//增加中量气血
const addMediumExpHP = new RandomEvent({
    odds: 0.20,
    fnc: async (_e, _monster, _msg) => {
        const expHP = rand(200, 500) * _monster.level;
        _msg.push(`击杀${_monster.name}后，你提炼出一瓶带有瑕疵的精血，服下后你的气血提升了${expHP}！`);
        AddBodyExp(_e.user_id, expHP);
    }
});

//获得大量灵石
const getLargeMoney = new RandomEvent({
    odds: 0.10,
    fnc: async (_e, _monster, _msg) => {
        const money = rand(700, 1000) * _monster.level;
        _msg.push(`跟随濒死的${_monster.name}，你发现了一条灵石矿脉，你获得了${money}灵石！！`);
        AddSpiritStone(_e.user_id, money);
    }
});

//获得中量灵石
const getMediumMoney = new RandomEvent({
    odds: 0.20,
    fnc: async (_e, _monster, _msg) => {
        const money = rand(200, 500) * _monster.level;
        _msg.push(`击杀${_monster.name}，你在旁边发现一个储物袋，你获得了${money}灵石！`);
        AddSpiritStone(_e.user_id, money);
    }
});

//获得远超等级的一件装备
const getAheadEquipment = new RandomEvent({
    odds: 0.10,
    fnc: async (_e, _monster, _msg) => {
        const targetLevel = clamp(_monster.level + 5, MinLevel, MaxLevel);
        const equipmentList = (await GetAllItem(['1', '2', '3'])).filter(item => item.dropLevel >= targetLevel);
        const equipment = equipmentList[rand(0, equipmentList.length)];
        _msg.push(`跟随濒死的${_monster.name}，你发现了一个隐蔽的山洞，在里面你找到了${equipment.name}！！`);
        AddItemByObj(_e.user_id, equipment, 1);
    }
});

//获得等级相关的一件装备
const getRelateEquipment = new RandomEvent({
    odds: 0.30,
    fnc: async (_e, _monster, _msg) => {
        const targetLevel = clamp(_monster.level, MinLevel, MaxLevel);
        const equipmentList = (await GetAllItem(['1', '2', '3'])).filter(item => item.dropLevel == targetLevel);
        const equipment = equipmentList[rand(0, equipmentList.length)];
        _msg.push(`在${_monster.name}旁边，你发现一件东西掉在地上，你获得了${equipment.name}！`);
        AddItemByObj(_e.user_id, equipment, 1);
    }
});

//获得远超等级的一本功法
const getAheadGongfa = new RandomEvent({
    odds: 0.10,
    fnc: async (_e, _monster, _msg) => {
        const targetLevel = clamp(_monster.level + 5, MinLevel, MaxLevel);
        const gongfaList = (await GetAllItem(['5'])).filter(item => item.dropLevel >= targetLevel);
        const gongfa = gongfaList[rand(0, gongfaList.length)];
        _msg.push(`跟随濒死的${_monster.name}，你发现了一个隐蔽的山洞，在里面你找到了《${gongfa.name}》！！`);
        AddItemByObj(_e.user_id, gongfa, 1);
    }
});

//获得等级相关的一本功法
const getRelateGongfa = new RandomEvent({
    odds: 0.30,
    fnc: async (_e, _monster, _msg) => {
        const targetLevel = clamp(_monster.level, MinLevel, MaxLevel);
        const gongfaList = (await GetAllItem(['5'])).filter(item => item.dropLevel == targetLevel);
        const gongfa = gongfaList[rand(0, gongfaList.length)];
        _msg.push(`在${_monster.name}旁边，你发现一件东西掉在地上，你获得了《${gongfa.name}》！！`);
        AddItemByObj(_e.user_id, gongfa, 1);
    }
});

//获得攻击力永久提升
const addMaxAttack = new RandomEvent({
    odds: 0.15,
    fnc: async (_e, _monster, _msg) => {
        const amount = rand(10, 100) * _monster.level;
        _msg.push(`在和${_monster.name}战斗后，你灵光一闪，攻击力提升了${amount}！！`);
        AddPowerByEvent(_e.user_id, { attack: amount });
    }
});

//获得生命值永久提升
const addMaxBlood = new RandomEvent({
    odds: 0.15,
    fnc: async (_e, _monster, _msg) => {
        const amount = rand(50, 500) * _monster.level;
        _msg.push(`在和${_monster.name}战斗后，你浑身气血涌动，你生命值提升了${amount}！！`);
        AddPowerByEvent(_e.user_id, { blood: amount });
    }
});

//获得防御力永久提升
const addMaxDefense = new RandomEvent({
    odds: 0.15,
    fnc: async (_e, _monster, _msg) => {
        const amount = rand(10, 100) * _monster.level;
        _msg.push(`在和${_monster.name}战斗后，你灵光一闪，防御力提升了${amount}！！`);
        AddPowerByEvent(_e.user_id, { defense: amount });
    }
});

//无事发生
const blank = new RandomEvent({
    odds: 1,
    fnc: async (_e, _monster, _msg) => { }
});

//----------------------------------------------------随机事件列表
//---------------添加随机事件后将其加入List，便可在战斗胜利后随机触发
const eventList = [
    addMediumExp,
    addLargeExp,
    addMediumExpHP,
    addLargeExpHP,
    getMediumMoney,
    getLargeMoney,
    getAheadEquipment,
    getRelateEquipment,
    getAheadGongfa,
    getRelateGongfa,
    addMaxAttack,
    addMaxBlood,
    addMaxDefense,
    blank,
];


class BattleVictory {
    constructor() {
        if (!BattleVictory.instance) {
            BattleVictory.instance = this;
            eventList.sort((a, b) => { return a.odds - b.odds; });
        }
        return BattleVictory.instance;
    }

    /******* 
     * @description: 战斗胜利后，随机触发一次事件
     * @param {*} _e 胜利者,plugin参数e
     * @param {Monster} _monster 击败的怪物
     * @param {[]} _msg 待发送消息列表
     */
    async TriggerEvent(_e, _monster, _msg) {
        for (let i = 0, done = false; i < eventList.length && !done; ++i) {
            const event = eventList[i];
            done = Math.random() < event.odds;
            if (done) await event.fnc(_e, _monster, _msg);
        }
    }
}
export default new BattleVictory();