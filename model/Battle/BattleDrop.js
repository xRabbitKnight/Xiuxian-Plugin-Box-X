import { GetRandItem } from "../Cache/item/Item.js";
import { AddItemsByObj, AddSpiritStone } from "../Cache/player/Backpack.js";


export async function GetDrops(_uid, _monster, _msg) {
    if (_monster.name.includes('BOSS')) {
        await boss(_uid, _monster, _msg);
        return;
    }

    await normal(_uid, _monster, _msg);
}

async function normal(_uid, _monster, _msg) {
    _msg.push(`采集出售从${_monster.name}获取的战利品，你获得了${_monster.level * 100}灵石`);
    AddSpiritStone(_uid, _monster.level * 100);

    const pellets = await GetRandItem("4", Math.floor(_monster.level / 5 + 1), _monster.level);
    pellets?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));
    AddItemsByObj(_uid, pellets);
}

async function boss(_uid, _monster, _msg) {
    _msg.push(`采集出售从${_monster.name}获取的战利品，你获得了${_monster.level * 1000}灵石`);
    AddSpiritStone(_uid, _monster.level * 1000);

    const pellets = await GetRandItem("4", Math.floor(_monster.level * 2));         //TODO 有点丑陋。有时间改改 
    pellets?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));
    AddItemsByObj(_uid, pellets);

    const props = await GetRandItem("6");
    props?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));
    AddItemsByObj(_uid, props);

    const skillBooks = await GetRandItem("7");
    skillBooks?.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));
    AddItemsByObj(_uid, skillBooks);
}