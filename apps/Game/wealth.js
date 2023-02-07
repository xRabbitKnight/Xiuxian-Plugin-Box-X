/*
 * @described :   玩家主动操作财富
 */

import config from '../../model/System/config.js';
import { segment } from 'oicq';
import { getAtUid, forceNumber } from '../../model/util';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import {
    IfAtSpot,
    GetBackpack, SetBackpack, CheckBackpackSpiritStone, GetBackpackSpiritStoneCount, AddSpiritStoneToBackpack, GetBackpackItem, AddItemToBackpack,
    CheckBackpackSpiritStone, GetWarehouseSpiritStoneCount, AddSpiritStoneToWarehouse, GetWarehouseItem, AddItemToWarehouse
} from '../../model/Cache';

export default class wealth extends plugin {
    constructor() {
        super({
            name: 'wealth',
            dsc: '玩家财富相关指令',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#升级储物袋$',
                    fnc: 'UpgradeBackpack'
                },
                {
                    reg: '^#(存|取)灵石(.*)$',
                    fnc: 'AccessSpiritStone'
                },
                {
                    reg: '^#(存|取)(.*)$',
                    fnc: 'AccessItem'
                },
                {
                    reg: '^#赠送灵石.*$',
                    fnc: 'GiveSpiritStone'
                },
                {
                    reg: '^#赠送.*$',
                    fnc: 'GiveProp'
                }
            ]
        });
    }

    UpgradeBackpack = async (e) => {
        const uid = e.user_id;

        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }

        if (!await IfAtSpot(uid, '炼器师协会')) {
            e.reply(`需回炼器师协会`);
            return;
        }

        const backpack = await GetBackpack(uid);
        const cfg = config.GetConfig('game/backpack.yaml');

        if (backpack.grade == cfg.maxLevel) {
            e.reply('已经是最高级的了');
            return;
        }
        if (backpack.spiritStone < cfg.upgradeCost[backpack.grade]) {
            e.reply(`灵石不足,还需要准备${cfg.upgradeCost[backpack.grade] - backpack.spiritStone}灵石`);
            return;
        }

        backpack.spiritStone -= cfg.upgradeCost[backpack.grade];
        backpack.capacity = cfg.capacity[backpack.grade + 1];
        backpack.grade += 1;
        SetBackpack(uid, backpack);
        e.reply('储物袋升级完毕！');
    }

    AccessSpiritStone = async (e) => {
        const uid = e.user_id;

        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }

        if (!await IfAtSpot(uid, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        const bpSpStone = await GetBackpackSpiritStoneCount(uid);
        const whSpStone = await GetWarehouseSpiritStoneCount(uid);
        const op = e.msg[1];
        let count = Math.max(1, forceNumber(e.msg.substr(4)));  //修正灵石数量至少为1


        if (op == '存' ? bpSpStone < count : whSpStone < count) {
            e.reply('灵石不足!');
            return;
        }

        count *= (op == '取' ? 1 : -1);
        if (!await CheckBackpackSpiritStone(uid, bpSpStone + count)) {
            e.reply(`储物袋存不下这么多灵石！`);
            return;
        }

        AddSpiritStoneToBackpack(uid, count);
        AddSpiritStoneToWarehouse(uid, -count);
        e.reply(`操作完成！\n储物袋灵石：${bpSpStone + count}\n仓库灵石：${whSpStone - count}`);
    }

    AccessItem = async (e) => {
        const uid = e.user_id;

        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }

        if (!await IfAtSpot(uid, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        let [name, count] = e.msg.substr(2).split('*');
        count = Math.max(1, forceNumber(count));    //修正数量至少为1

        const op = e.msg.substr(1, 1);
        const item = (op == '存' ? await GetBackpackItem(uid, name) : await GetWarehouseItem(uid, name));
        if (item == undefined || item.acount < count) {
            e.reply(`没有足够的${name} * ${count}!`);
            return;
        }

        count *= (op == '存' ? -1 : 1);
        AddItemToBackpack(uid, item, count);
        AddItemToWarehouse(uid, item, -count);
        e.reply('操作成功！');
    }

    GiveSpiritStone = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        }

        const giverId = e.user_id;
        const doneeId = getAtUid(e);

        if (doneeId == undefined || !await CheckStatu({ user_id: doneeId }, StatuLevel.alive, false)) {
            e.reply("获赠者不存在！");
            return;
        }

        if (doneeId == giverId) {
            e.reply("请不要赠送给自己！");
            return;
        }

        const count = Math.max(forceNumber(e.msg.replace('#赠送灵石', '')), 1);
        if ((await GetBackpackSpiritStoneCount(giverId)) < count) {
            e.reply([segment.at(giverId), `似乎没有${count}灵石.`]);
            return;
        }

        AddSpiritStoneToBackpack(giverId, -count);
        AddSpiritStoneToWarehouse(doneeId, count);
        e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${count}灵石.`]);
    }

    GiveProp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        }

        const giverId = e.user_id;
        const doneeId = getAtUid(e);

        if (doneeId == undefined || !await CheckStatu({ user_id: doneeId }, StatuLevel.alive, false)) {
            e.reply("获赠者不存在！");
            return;
        }

        if (doneeId == giverId) {
            e.reply("请不要赠送给自己！");
            return;
        }

        let [propName, count] = e.msg.replace('#赠送', '').replace('{at:*}', '').split('*');
        count = Math.max(forceNumber(count), 1);

        const prop = await GetBackpackItem(giverId, propName);
        if (prop == undefined || prop.acount < count) {
            e.reply([segment.at(giverId), `似乎没有${propName} * ${count}`]);
            return;
        }

        AddItemToBackpack(giverId, prop, -count);
        AddItemToWarehouse(doneeId, prop, count);
        e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${propName} * ${count}`]);
    }
}