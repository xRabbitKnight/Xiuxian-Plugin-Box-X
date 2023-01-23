import CONFIG from '../Init.js';
import plugin from '../../../../../lib/plugins/plugin.js';
import { IfAtSpot } from '../../../model/Cache/place/Spot.js';
import { CheckSpiritStone, GetBackpackInfo, SetBackpackInfo } from '../../../model/Cache/player/Backpack.js';
import { CheckStatu, StatuLevel } from '../../../model/Statu/Statu.js';
import { GetCommodities, SetCommodities } from '../../xiuxian-plugin/model/Cache/shop.js';
import { filterItemsByName, mergeItems } from '../model/utils.js';

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
                    fnc: 'sellAll'
                },
                {
                    reg: '^#快捷购买.+$',
                    fnc: 'buyAll'
                },
                {
                    reg: '^#快捷测试$',
                    fnc: 'test'
                }
            ]
        })
    }

    sellAll = async (e) => {
        logger.info(CONFIG.pluginPath)
    }

    sellAll = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }
        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂`);
            return;
        }

		let itemName = e.msg.substr(5)
        let backpack = await GetBackpackInfo(e.user_id);
        let [included, excluded] = filterItemsByName(itemName, backpack.items)

        if (included.length < 1) {
            e.reply('[凡仙堂]小二\n你没有符合的物品！');
            return;
        }

        let totalMoney = countMoney(included);
        if(!await CheckSpiritStone(e.user_id, totalMoney)){
            e.reply(`[凡仙堂]小二\n你的储物袋装不下${totalMoney}灵石！`);
            return;
        }

        backpack.items = excluded;
        backpack.spiritStone += totalMoney;
        SetBackpackInfo(e.user_id, backpack);

        e.reply(`[凡仙堂]小二\n出售全部${itemName},得到${totalMoney}灵石 `);
    }

    buyAll = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }
        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂`);
            return;
        }

		let itemName = e.msg.substr(5)
        let commodities = await GetCommodities();
        let [included, excluded] = filterItemsByName(itemName, commodities)

        if (included.length < 1) {
            e.reply(`[凡仙堂]小二\n${itemName}存量不足！`);
            return;
        }

        let cost = countMoney(included);
        let backpack = await GetBackpackInfo(e.user_id);
        if (backpack.spiritStone < cost) {
            e.reply(`[凡仙堂]小二\n灵石不足`);
            return;
        }

        backpack.items = mergeItems(backpack.items, included);
        backpack.spiritStone -= cost;
        SetBackpackInfo(e.user_id, backpack);
        SetCommodities(excluded);

        e.reply(`[凡仙堂]小二\n你花[${cost}]灵石购买了全部[${itemName}`);
    }
}

function countMoney(items) {
    let totalMoney = 0;
    items.forEach(item => {
        totalMoney += item.price * item.acount
    });
    return totalMoney;
}