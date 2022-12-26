import plugin from '../../../../lib/plugins/plugin.js';
import { AddSpiritStone, GetBackpackInfo, SetBackpackInfo } from '../../model/Cache/Backpack.js';
import config from '../../model/Config.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { point_map, Read_action } from '../Xiuxian/Xiuxian.js';
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
                },
                {
                    reg: '^#一键出售.*$',
                    fnc: 'OneKey_key'
                }
            ]
        });
        this.xiuxianConfigData = config.getConfig('xiuxian', 'xiuxian');
    };

    /**
     * 此功能需要去#万宝楼
     * 装备物品个数需要控制！
     */

    OneKey_all = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        const usr_qq = e.user_id;
        const action = await Read_action(usr_qq);
        const address_name = '万宝楼';
        const map = await point_map(action, address_name);
        if (!map) {
            e.reply(`需回${address_name}`);
            return;
        };

        const backpack = await GetBackpackInfo(e.user_id);
        let money = 0;
        for (let item of backpack.thing) {
            money += item.acount * item.price;
        };
        AddSpiritStone(e.user_id, money);
        backpack.thing = [];
        SetBackpackInfo(e.user_id, backpack);

        e.reply(`[蜀山派]叶铭\n这是${money}灵石,道友慢走`);
        return;
    };

    OneKey_key = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }
        return;
    };
};