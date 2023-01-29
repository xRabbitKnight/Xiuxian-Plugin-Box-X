import { IfAtSpot } from '../../../model/Cache/place/Spot.js';
import { CheckStatu, StatuLevel } from '../../../model/Statu/Statu.js';
import { replyForwardMsg } from '../../../model/util/gameUtil.js';
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
        let whSpStone = await whOp.GetSpiritStoneCount(e.user_id);

        let restCapacity = backpack.capacity - backpack.spiritStone;
        if (op == '存') {
            count = backpack.spiritStone;
        } else if (restCapacity < 0) {
            e.reply(`背包已经满了${backpack.spiritStone}/${backpack.capacity}，装不下更多灵石！`);
            return;
        } else {
            count = -Math.min(whSpStone, restCapacity);
        }

        bpOp.AddSpiritStone(e.user_id, -count);
        whOp.AddSpiritStone(e.user_id, count);
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

        let { included, excluded } = await filterItemsByName(itemName, '存' ? backpack.items : warehouse.items);

        if (included.length < 1) {
            e.reply(`没有可以${op}的[${itemName}]`);
            return;
        }

        if (op == '存') {
            await whOp.AddItemsByObj(e.user_id, ...included);
            included.forEach(item => { item.acount *= -1; });
            bpOp.AddItemsByObj(e.user_id, ...included);
        } else {
            await bpOp.AddItemsByObj(e.user_id, ...included);
            included.forEach(item => { item.acount *= -1; });
            whOp.AddItemsByObj(e.user_id, ...included);
        }

        let msgList = listItems(`共${op == '存' ? '存入' : '取出'}${included.length}种物品`, included);
        replyForwardMsg(e, msgList);
    }
}