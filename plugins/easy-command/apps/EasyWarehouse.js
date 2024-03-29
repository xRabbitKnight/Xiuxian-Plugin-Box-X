import { segment } from 'oicq';
import { IfAtSpot } from '../../../model/Cache/place/Spot.js';
import { CheckStatu, StatuLevel } from '../../../model/Statu/Statu.js';
import { getAtUid, replyForwardMsg } from '../../../model/util/gameUtil.js';
import { filterItemsByName, listItems, mergeItems } from '../model/utils.js';
import * as bpOp from '../../../model/Cache/player/Backpack.js';
import * as whOp from '../../../model/Cache/player/Warehouse.js';

export default class EasyWarehouse extends plugin {
    constructor() {
        super({
            name: 'EasyWarehouse',
            dsc: 'Easy commands for warehouse',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#快捷(存|取)灵石$',
                    fnc: 'easyAccessSpiritStone'
                },
                {
                    reg: '^#快捷(存|取)(.+)$',
                    fnc: 'easyAccessItems'
                },
                {
                    reg: '^#快捷赠送.*$',
                    fnc: 'easyGiveProp'
                }
            ]
        })
    }

    easyAccessSpiritStone = async (e) => {
        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }
        if (!await IfAtSpot(e.user_id, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        let op = e.msg[3], count = 0;
        let backpack = await bpOp.GetBackpack(e.user_id);
        let whSpStone = await whOp.GetWarehouseSpiritStoneCount(e.user_id);

        let restCapacity = backpack.capacity - backpack.spiritStone;
        if (op == '存') {
            count = backpack.spiritStone;
        } else if (restCapacity < 0) {
            e.reply(`背包已经满了${backpack.spiritStone}/${backpack.capacity}，装不下更多灵石！`);
            return;
        } else {
            count = -Math.min(whSpStone, restCapacity);
        }

        bpOp.AddSpiritStoneToBackpack(e.user_id, -count);
        whOp.AddSpiritStoneToWarehouse(e.user_id, count);
        e.reply(`${op == '存' ? '存入' : '取出'}${Math.abs(count)}灵石\n储物袋灵石：${backpack.spiritStone - count}\n仓库灵石：${whSpStone + count}`);
    }

    easyAccessItems = async (e) => {
        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }
        if (!await IfAtSpot(e.user_id, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        let op = e.msg[3];
        let itemName = e.msg.substr(4);
        let backpack = await bpOp.GetBackpack(e.user_id);
        let warehouse = await whOp.GetWarehouse(e.user_id);

        let { included, excluded } = await filterItemsByName(itemName, op == '存' ? backpack.items : warehouse.items);

        if (included.length < 1) {
            e.reply(`没有可以${op}的[${itemName}]！`);
            return;
        }

        let minusIncluded = [];
        included.forEach((item, index, self) => {
            minusIncluded.push(Object.assign({}, item));
            minusIncluded[index].acount *= -1;
        });
        bpOp.AddItemsToBackpack(e.user_id, ...(op == '存' ? minusIncluded : included));
        whOp.AddItemsToWarehouse(e.user_id, ...(op == '存' ? included : minusIncluded));

        let msgList = listItems(`共${op == '存' ? '存入' : '取出'}${included.length}种物品`, included);
        replyForwardMsg(e, msgList);
    }

    easyGiveProp = async (e) => {
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

        let itemName = e.msg.substr(5);
        if (itemName == '灵石') {
            e.reply('不能快捷赠送灵石！');
            return;
        }

        let backpack = await bpOp.GetBackpack(giverId);
        let { included, excluded } = await filterItemsByName(itemName, backpack.items);

        if (included.length < 1) {
            e.reply(`没有可以赠送的[${itemName}]！`);
            return;
        }

        let minusIncluded = [];
        included.forEach((item, index, self) => {
            minusIncluded.push(Object.assign({}, item));
            minusIncluded[index].acount *= -1;
        });
        bpOp.AddItemsToBackpack(giverId, ...minusIncluded);
        whOp.AddItemsToWarehouse(doneeId, ...included);

        e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的[${itemName}]`]);
        replyForwardMsg(e, listItems(`共赠送${included.length}种物品`, included));
    }
}