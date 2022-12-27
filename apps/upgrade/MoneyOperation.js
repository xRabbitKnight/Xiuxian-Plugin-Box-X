import plugin from '../../../../lib/plugins/plugin.js';
import data from '../../model/XiuxianData.js';
import config from '../../model/Config.js';
import { segment } from 'oicq';
import fs from 'node:fs';
import { Read_level, Read_najie, Add_najie_thing, Write_najie, Add_lingshi, At, Write_action } from '../Xiuxian/Xiuxian.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { forceNumber } from '../../model/mathCommon.js';
import { AddItemByObj as bpAddItem, AddSpiritStone as bpAddSpiritStone, GetItemByName, GetSpiritStoneCount } from '../../model/Cache/player/Backpack.js';
import { AddItemByObj as whAddItem, AddSpiritStone as whAddSpiritStone } from '../../model/Cache/player/Warehouse.js';

export class MoneyOperation extends plugin {
    constructor() {
        super({
            name: 'MoneyOperation',
            dsc: 'MoneyOperation',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#赠送灵石.*$',
                    fnc: 'GiveSpiritStone'
                },
                {
                    reg: '^#赠送.*$',
                    fnc: 'GiveProp'
                },
                {
                    reg: '^#联盟报到$',
                    fnc: 'New_lingshi'
                }
            ]
        });
        this.xiuxianConfigData = config.getConfig('xiuxian', 'xiuxian');
    };

    New_lingshi = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        };

        if (!await IfAtSpot(e.user_id, '联盟')) {
            e.reply(`需回联盟`);
            return;
        }

        const usr_qq = e.user_id;
        const level = await Read_level(usr_qq);
        if (level.level_id != 1) {
            return;
        };
        if (action.newnoe != 1) {
            return;
        };
        action.newnoe = 0;
        await Write_action(usr_qq, action);
        const equipment_name = '烂铁匕首';
        const money = Number(5);
        const ifexist = JSON.parse(fs.readFileSync(`${data.__PATH.all}/all.json`)).find(item => item.name == equipment_name);
        let najie = await Read_najie(usr_qq);
        najie = await Add_najie_thing(najie, ifexist, Number(1));
        await Write_najie(usr_qq, najie);
        await Add_lingshi(usr_qq, money);
        e.reply(`[修仙联盟]方正\n看你骨骼惊奇\n就送你一把[${equipment_name}]吧\n还有这${money}灵石\n可在必要的时候用到`);
        e.reply(`你对此高兴万分\n把[${equipment_name}]放进了#储物袋`)
        return;
    };

    GiveSpiritStone = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        };

        const giverId = e.user_id;
        const doneeId = await At(e);

        if (doneeId == 0) {
            e.reply("获赠者不存在！");
            return;
        };

        if (doneeId == giverId) {
            e.reply("请不要赠送给自己！");
            return;
        }

        const count = Math.max(forceNumber(e.msg.replace('#赠送灵石', '')), 1);
        if ((await GetSpiritStoneCount(giverId)) < count) {
            e.reply([segment.at(giverId), `似乎没有${count}灵石.`]);
            return;
        };

        bpAddSpiritStone(giverId, -count);
        whAddSpiritStone(doneeId, count);
        e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${count}灵石.`]);
    }

    GiveProp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        };

        const giverId = e.user_id;
        const doneeId = await At(e);

        if (doneeId == 0) {
            e.reply("获赠者不存在！");
            return;
        };

        if (doneeId == giverId) {
            e.reply("请不要赠送给自己！");
            return;
        }

        let [propName, count] = e.msg.replace('#赠送', '').replace('{at:*}', '').split('*');
        count = Math.max(forceNumber(count), 1);

        const prop = await GetItemByName(giverId, propName);
        if (prop == undefined || prop.acount < count) {
            e.reply([segment.at(giverId), `似乎没有${propName} * ${count}`]);
            return;
        }

        bpAddItem(giverId, prop, -count);
        whAddItem(doneeId, prop, count);
        e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${propName} * ${count}`]);
    }
};
