import { IfAtSpot } from '../../../model/Cache/place/Spot.js';
import { GetBackpack, SetBackpack, AddSpiritStone as bpAddSpStone } from '../../../model/Cache/player/Backpack.js';
import { GetWarehouseInfo, SetWarehouseInfo, GetSpiritStoneCount as whGetSpStoneCount, AddSpiritStone as whAddSpStone } from '../../../model/Cache/player/Warehouse.js';
import { CheckStatu, StatuLevel } from '../../../model/Statu/Statu.js';
import { replyForwardMsg } from '../../../model/util/gameUtil.js';
import { filterItemsByName, listItems, mergeItems } from '../model/utils.js';

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
        if (!await IfAtSpot(uid, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        let op = e.msg[3], count = 0;
        let backpack = await GetBackpack(e.user_id);
        let whSpStone = await whGetSpStoneCount(e.user_id);

        let restCapacity = backpack.capacity - backpack.spiritStone;
        if (op == '存') {
            count = backpack.spiritStone;
        } else if (restCapacity < 0) {
            e.reply(`背包已经满了${backpack.spiritStone}/${backpack.capacity}，装不下更多灵石！`);
            return;
        } else {
            count = -Math.min(whSpStone, restCapacity);
        }

        bpAddSpStone(e.user_id, -count);
        whAddSpStone(e.user_id, count);
        e.reply(`操作完成！${op == '存' ? '存入' : '取出'}${Math.abs(count)}灵石\n储物袋灵石：${backpack.spiritStone - count}\n仓库灵石：${whSpStone + count}`);
    }

    easyAccessItems = async (e) => {
        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }
        if (!await IfAtSpot(uid, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        let op = e.msg[3];
        let itemName = e.msg.substr(4);
        let backpack = await GetBackpack(e.user_id);
        let warehouse = await GetWarehouseInfo(e.user_id);
        let fromItems = op == '存' ? backpack.items : warehouse.items;
        let toItems = op == '存' ? warehouse.items : backpack.items;

        let { included, excluded } = await filterItemsByName(itemName, fromItems);

        if (included.length < 1) {
            e.reply(`没有可以${op}的[${itemName}]`);
            return;
        }
        fromItems = excluded;
        toItems = mergeItems(toItems, included);
        
        backpack.items = op == '存' ? fromItems : toItems;
        warehouse.items = op == '存' ? toItems : fromItems;
        SetBackpack(e.user_id, backpack);
        SetWarehouseInfo(e.user_id, warehouse);

        let msgList = listItems(`共${op == '存' ? '存入' : '取出'}${included.length}种物品`, included);
        replyForwardMsg(e, msgList);
    }
}