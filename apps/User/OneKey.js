import plugin from '../../../../lib/plugins/plugin.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
import { AddSpiritStone, GetBackpackInfo, SetBackpackInfo } from '../../model/Cache/player/Backpack.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
export class OneKey extends plugin {
    constructor() {
        super({
            name: 'OneKey',
            dsc: 'OneKey',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#一键出售所有$',
                    fnc: 'OneKey_all'
                }
            ]
        })
    }

    /**
     * 此功能需要去#万宝楼
     * 装备物品个数需要控制！
     */

    OneKey_all = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        const backpack = await GetBackpackInfo(e.user_id);

        if (backpack.lingshi >= backpack.lingshimax) {
            e.reply('储物袋灵石已经满了！');
            return;
        }

        let money = 0;
        for (let item of backpack.thing) {
            money += item.acount * item.price;
        }
        backpack.thing = [];
        await SetBackpackInfo(e.user_id, backpack);
        AddSpiritStone(e.user_id, money);

        e.reply(`[蜀山派]叶铭\n这是${money}灵石,道友慢走`);
    }
}