import config from "../../../model/System/config.js"
import data from "../model/System/data.js";
import { CheckStatu, StatuLevel } from "../../../model/Statu/Statu.js";
import { GetCommodities, SetCommodities } from "../model/Cache/shop.js";
import { GetShopImage } from "../model/Image/pluginImage.js";
import {
    GetItemObj, GetRandItem,
    IfAtSpot,
    AddItemToBackpack, AddSpiritStoneToBackpack, GetBackpackSpiritStoneCount, GetBackpackItem, CheckBackpackSpiritStone
} from "../../../model/Cache";
import { clamp, forceNumber } from "../../../model/util";

export default class Shop extends plugin {
    constructor() {
        super({
            name: 'Shop',
            dsc: '凡仙堂商店',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#凡仙堂$',
                    fnc: 'Shop',
                },
                {
                    reg: '^#购买.*$',
                    fnc: 'Buy'
                },
                {
                    reg: '^#出售.*$',
                    fnc: 'Sell'
                },
            ]
        });
        this.task = {
            name: "定时刷新商店货物",
            cron: config.GetConfig(['task', 'shop.yaml'], data.__configPath).cron,
            fnc: () => this.RefreshShop(),
        }
    }

    Shop = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂`);
            return;
        }

        e.reply(await GetShopImage());
    }

    Buy = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂`);
            return;
        }

        const commodities = await GetCommodities();
        let [name, count] = e.msg.replace('#购买', '').split('\*');
        count = clamp(forceNumber(count), 1, 99);

        const commodity = commodities.find(item => item.name == name);
        if (commodity == undefined || commodity.acount < count) {
            e.reply(`[凡仙堂]小二\n物品${name}存量不足！`);
            return;
        }

        const cost = commodity.price * count;
        if ((await GetBackpackSpiritStoneCount(e.user_id)) < cost) {
            e.reply(`[凡仙堂]小二\n灵石不足`);
            return;
        }

        if ((commodity.acount -= count) == 0) commodities.splice(commodities.indexOf(commodity), 1);
        SetCommodities(commodities);

        e.reply(`[凡仙堂]小二\n你花[${cost}]灵石购买了[${name}]*${count}`);
        AddSpiritStoneToBackpack(e.user_id, -cost);
        AddItemToBackpack(e.user_id, commodity, count);
    }

    Sell = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂`);
            return;
        }

        let [name, count] = e.msg.replace('#出售', '').split('\*');
        count = clamp(forceNumber(count), 1, 99);

        const commodity = await GetBackpackItem(e.user_id, name);
        if (commodity == undefined || commodity.acount < count) {
            e.reply(`[凡仙堂]小二\n你没似乎没有${name} * ${count}`);
            return;
        }

        const money = commodity.price * count;
        if (!await CheckBackpackSpiritStone(e.user_id, money)) {
            e.reply(`[凡仙堂]小二\n你的储物袋装不下${money}灵石！`);
            return;
        }

        AddSpiritStoneToBackpack(e.user_id, money);
        AddItemToBackpack(e.user_id, commodity, -count);

        e.reply(`[凡仙堂]小二\n出售${name}*${count},得到${money}灵石 `);
    }

    RefreshShop = async (e) => {
        const cfg = config.GetConfig(['task', 'shop.yaml'], data.__configPath);

        const commodities = [];
        commodities.push(...(await GetRandItem('丹药', cfg.pellet.count, cfg.pellet.maxLevel)));
        commodities.push(...(await GetRandItem('功法', cfg.manual.count, cfg.manual.maxLevel)));
        commodities.push(await GetItemObj({ name: '传送卷轴', count: 20 }));

        commodities.sort((a, b) => a.id.localeCompare(b.id));
        SetCommodities(commodities);
    }
}