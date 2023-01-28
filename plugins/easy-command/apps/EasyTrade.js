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
        
        let overflow = false;
        if(!await CheckSpiritStone(e.user_id, totalMoney)){
            if (included.length > 1) {
                overflow = true;
            } else if (backpack.capacity - backpack.spiritStone < included[0].price) {
                overflow = true;
            } else {
                let curNum = Math.floor((backpack.capacity - backpack.spiritStone) / included[0].price);
                let maxNum = included[0].acount;
                let backpackItem = Object.assign({}, included[0]);
                included[0].acount = curNum;
                backpackItem.acount = maxNum - curNum;
                excluded.push(backpackItem);
                totalMoney = countMoney(included);
            }
        }
        if (overflow) {
            e.reply(`[凡仙堂小二]\n储物袋灵石已满，装不下这么多灵石！`);
            return;
        }

        backpack.items = excluded;
        backpack.spiritStone += totalMoney;
        SetBackpack(e.user_id, backpack);

        if (included.length == 1) {
            e.reply(`[凡仙堂小二]\n出售[${included[0].name}] * ${included[0].acount}，得到[${totalMoney}]灵石`);
        } else {
            let msgList = listItems(`[凡仙堂小二]\n出售全部[${itemName}]，得到[${totalMoney}]灵石`, included);
            replyForwardMsg(e, msgList);
        }
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
        
        let lack = false;
        if (backpack.spiritStone < cost) {
            if (included.length > 1) {
                lack = true;
            } else if (backpack.spiritStone < included[0].price) {
                lack = true;
            } else {
                let curNum = Math.floor(backpack.spiritStone / included[0].price);
                let maxNum = included[0].acount;
                let shopItem = Object.assign({}, included[0]);
                included[0].acount = curNum;
                shopItem.acount = maxNum - curNum;
                excluded.push(shopItem);
                cost = countMoney(included);
            }
        }
        if (lack) {
            e.reply(`[凡仙堂小二]\n灵石不足，买不了这些东西！`);
            return;
        }

        backpack.items = mergeItems(backpack.items, included);
        backpack.spiritStone -= cost;
        SetBackpack(e.user_id, backpack);
        SetCommodities(excluded);

        if (included.length == 1) {
            e.reply(`[凡仙堂小二]\n花费[${cost}]灵石购买了[${included[0].name}] * ${included[0].acount}`);
        } else {
            let msgList = listItems(`[凡仙堂小二]\n你花[${cost}]灵石购买了全部[${itemName}]`, included);
            replyForwardMsg(e, msgList);
        }
    }
}

function countMoney(items) {
    let totalMoney = 0;
    items.forEach(item => {
        totalMoney += item.price * item.acount
    });
    return totalMoney;
}