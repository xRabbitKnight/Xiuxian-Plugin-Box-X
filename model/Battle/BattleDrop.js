import { GetRandItem } from "../Cache/item/Item.js";
import { AddItemsByObj, AddSpiritStone } from "../Cache/player/Backpack.js";

/** 
 *  配置掉落物怪物标签 
 *      插件接口 可自定义掉落函数，在初始化时加入MonsterTip
 *      然后在自定义monster修改标签dropTip
 */
export const MonsterTip = {
    "normal": normal,
    "boss": boss,
}

/**
 * @description:  配置怪物击杀掉落
 * @param {string} _uid 玩家id
 * @param {*} _monster 击杀的怪物
 * @param {[]} _msg 消息集合
 * @return 无返回值
 */
export async function GetDrops(_uid, _monster, _msg) {
    if (_monster == undefined) {
        logger.error(`掉落方法击杀怪物undefined！`);
        return;
    }

    if (MonsterTip[_monster.dropTip] == undefined) {
        logger.error(`未定义掉落方法${_tip}!`);
        return;
    }

    await MonsterTip[_monster.dropTip](_uid, _monster, _msg);
}

/** 常规掉落*/
async function normal(_uid, _monster, _msg) {
    _msg.push(`采集出售从${_monster.name}获取的战利品，你获得了${_monster.level * 100}灵石`);
    AddSpiritStone(_uid, _monster.level * 100);

    const pellets = await GetRandItem("4", Math.floor(_monster.level / 5 + 1), _monster.level);
    pellets?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));
    AddItemsByObj(_uid, ...pellets);
}

/** boss掉落 */
async function boss(_uid, _monster, _msg) {
    _msg.push(`采集出售从${_monster.name}获取的战利品，你获得了${_monster.level * 1000}灵石`);
    AddSpiritStone(_uid, _monster.level * 1000);

    const pellets = await GetRandItem("4", Math.floor(_monster.level * 2));         //TODO 有点丑陋。有时间改改 
    pellets?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));

    const props = await GetRandItem("6");
    props?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));

    const skillBooks = await GetRandItem("7");
    skillBooks?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));
    
    AddItemsByObj(_uid, ...pellets, ...props, ...skillBooks);
}