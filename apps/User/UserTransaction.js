import plugin from '../../../../lib/plugins/plugin.js';
import data from '../../model/XiuxianData.js';
import fs from 'node:fs';
import { ForwardMsg, __PATH } from '../Xiuxian/Xiuxian.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { clamp, forceNumber } from '../../model/mathCommon.js';
import { AddItemByObj, AddSpiritStone, GetItemByName, GetSpiritStoneCount } from '../../model/Cache/player/Backpack.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
export class UserTransaction extends plugin {
    constructor() {
        super({
            name: 'UserTransaction',
            dsc: 'UserTransaction',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#购买.*$',
                    fnc: 'Buy'
                },
                {
                    reg: '^#出售.*$',
                    fnc: 'Sell'
                },
                {
                    reg: '^#凡仙堂$',
                    fnc: 'ningmenghome',
                },
            ]
        });
    };
    ningmenghome = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }
        
        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂`);
            return;
        }

        const msg = [
            '___[凡仙堂]___\n#购买+物品名*数量\n不填数量,默认为1'
        ];
        const commodities_list = JSON.parse(fs.readFileSync(`${data.__PATH.all}/commodities.json`));
        commodities_list.forEach((item) => {
            const id = item.id.split('-');
            if (id[0] == 4) {
                if (id[1] == 1) {
                    msg.push(`物品:${item.name}\n气血:${item.blood}%\n价格:${item.price}`);
                } else {
                    msg.push(`物品:${item.name}\n修为:${item.experience}\n价格:${item.price}`);
                }
            }
            else if (id[0] == 5) {
                msg.push(`物品:${item.name}\n天赋:${item.size}%\n价格:${item.price}`);
            }
            else {
                msg.push(`物品:${item.name}\n价格:${item.price}`);
            };
        });
        ForwardMsg(e, msg);
    };

    Buy = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '凡仙堂')) {
            e.reply(`需回凡仙堂`);
            return;
        }

        let [name, count] = e.msg.replace('#购买', '').split('\*');
        count = clamp(forceNumber(count), 1, 99);

        const ifexist = JSON.parse(fs.readFileSync(`${data.__PATH.all}/commodities.json`)).find(item => item.name == name);
        if (!ifexist) {
            e.reply(`[凡仙堂]小二\n不卖:${thing_name}`);
            return;
        };

        const commodities_price = ifexist.price * count;
        if ((await GetSpiritStoneCount(e.user_id)) < commodities_price) {
            e.reply(`[凡仙堂]小二\n灵石不足`);
            return;
        };

        await AddSpiritStone(e.user_id, -commodities_price);      //异步写入目前没有太好的解决方案，短时间连续相同写入请加await等待执行完成
        AddItemByObj(e.user_id, ifexist, count)

        e.reply(`[凡仙堂]薛仁贵\n你花[${commodities_price}]灵石购买了[${name}]*${count},`);
    };

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

        const prop = await GetItemByName(e.user_id, name);
        if (prop == undefined || prop.acount < count) {
            e.reply(`[凡仙堂]小二\n你没似乎没有${propName} * ${count}`);
            return;
        }

        await AddSpiritStone(e.user_id, prop.price * count);        //异步写入目前没有太好的解决方案，短时间连续相同写入请加await等待执行完成
        AddItemByObj(e.user_id, prop, -count)

        e.reply(`[凡仙堂]欧阳峰\n出售得${prop.price * count}灵石 `);
    };
};