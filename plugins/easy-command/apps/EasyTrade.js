import { IfAtSpot } from '../../../model/Cache/place/Spot.js';
import { CheckSpiritStone, GetBackpack, SetBackpack } from '../../../model/Cache/player/Backpack.js';
import { CheckStatu, StatuLevel } from '../../../model/Statu/Statu.js';
import { replyForwardMsg } from '../../../model/util/gameUtil.js';
import { GetCommodities, SetCommodities } from '../../xiuxian-plugin/model/Cache/shop.js';
import { filterItemsByName, listItems, mergeItems } from '../model/utils.js';

/**
 * 快捷出售购买所有物品或者某个类别物品
 * 武器 护具 法宝 装备 恢复药 修为药 气血药 丹药 功法 技能书 全部物品 [物品名称]
 */
export default class EasyTrade extends plugin {
    constructor() {
        super({
            name: 'EasyTrade',
            dsc: 'Easy commands for trade',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#快捷出售.+$',
                    fnc: 'easySell'
                },
                {
                    reg: '^#快捷购买.+$',
                    fnc: 'easyBuy'
                }
            ]
        })
    }

    easySell = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }
        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂！`);
            return;
        }

        let itemName = e.msg.substr(5);
        let backpack = await GetBackpack(e.user_id);
        let { included, excluded } = await filterItemsByName(itemName, backpack.items);

        if (included.length < 1) {
            e.reply(`[凡仙堂小二]\n你没有符合的物品[${itemName}]！`);
            return;
        }

        let totalMoney = countMoney(included);
        if (!await CheckSpiritStone(e.user_id, totalMoney)) {
            e.reply(`[凡仙堂小二]\n你的储物袋装不下[${totalMoney}]灵石！`);
            return;
        }

        backpack.items = excluded;
        backpack.spiritStone += totalMoney;
        SetBackpack(e.user_id, backpack);

        let msgList = listItems(`[凡仙堂小二]\n出售全部[${itemName}],得到[${totalMoney}]灵石`, included);
        replyForwardMsg(e, msgList);
    }

    easyBuy = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }
        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂！`);
            return;
        }

        let itemName = e.msg.substr(5);
        let commodities = await GetCommodities();
        let { included, excluded } = await filterItemsByName(itemName, commodities);

        if (included.length < 1) {
            e.reply(`[凡仙堂小二]\n[${itemName}]存量不足！`);
            return;
        }

        let cost = countMoney(included);
        let backpack = await GetBackpack(e.user_id);
        if (backpack.spiritStone < cost) {
            e.reply(`[凡仙堂小二]\n灵石不足[${cost}]，无法购买全部[${itemName}]！`);
            return;
        }

        backpack.items = mergeItems(backpack.items, included);
        backpack.spiritStone -= cost;
        SetBackpack(e.user_id, backpack);
        SetCommodities(excluded);

        let msgList = listItems(`[凡仙堂小二]\n你花[${cost}]灵石购买了全部[${itemName}]`, included);
        replyForwardMsg(e, msgList);
    }
}

function countMoney(items) {
    let totalMoney = 0;
    items.forEach(item => {
        totalMoney += item.price * item.acount
    });
    return totalMoney;
}