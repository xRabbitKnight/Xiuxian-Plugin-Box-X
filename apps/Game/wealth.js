/*
 * @described :   玩家主动操作财富
 */

import config from '../../model/System/config.js';
import { segment } from 'oicq';
import { getAtUid } from '../../model/util/gameUtil.js';
import { forceNumber } from '../../model/util/math.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import * as bpOp from '../../model/Cache/player/Backpack.js';
import * as whOp from '../../model/Cache/player/Warehouse.js';

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

        const backpack = await bpOp.GetBackpack(uid);
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
        bpOp.SetBackpack(uid, backpack);
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

        const bpSpStone = await bpOp.GetSpiritStoneCount(uid);
        const whSpSone = await whOp.GetSpiritStoneCount(uid);
        const op = e.msg[1];
        let count = Math.max(1, forceNumber(e.msg.substr(4)));  //修正灵石数量至少为1


        if (op == '存' ? bpSpStone < count : whSpSone < count) {
            e.reply('灵石不足!');
            return;
        }

        count *= (op == '取' ? 1 : -1);
        if (!await bpOp.CheckSpiritStone(uid, bpSpStone + count)) {
            e.reply(`储物袋存不下这么多灵石！`);
            return;
        }

        bpOp.AddSpiritStone(uid, count);
        whOp.AddSpiritStone(uid, -count);
        e.reply(`操作完成！储物袋灵石:${bpSpStone + count}, 仓库灵石:${whSpSone - count}`);
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
        const item = (op == '存' ? await bpOp.GetItemByName(uid, name) : await whOp.GetItemByName(uid, name));
        if (item == undefined || item.acount < count) {
            e.reply(`没有足够的${name} * ${count}!`);
            return;
        }

        count *= (op == '存' ? -1 : 1);
        bpOp.AddItemByObj(uid, item, count);
        whOp.AddItemByObj(uid, item, -count);
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
        if ((await bpOp.GetSpiritStoneCount(giverId)) < count) {
            e.reply([segment.at(giverId), `似乎没有${count}灵石.`]);
            return;
        }

        bpOp.AddSpiritStone(giverId, -count);
        whOp.AddSpiritStone(doneeId, count);
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

        const prop = await bpOp.GetItemByName(giverId, propName);
        if (prop == undefined || prop.acount < count) {
            e.reply([segment.at(giverId), `似乎没有${propName} * ${count}`]);
            return;
        }

        bpOp.AddItemByObj(giverId, prop, -count);
        whOp.AddItemByObj(doneeId, prop, count);
        e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${propName} * ${count}`]);
    }
}