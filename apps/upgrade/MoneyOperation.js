import { segment } from 'oicq';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { forceNumber } from '../../model/mathCommon.js';
import { getAtUid } from '../../model/utility.js';
import { AddItemByObj as bpAddItem, AddSpiritStone as bpAddSpiritStone, GetItemByName, GetSpiritStoneCount } from '../../model/Cache/player/Backpack.js';
import { AddItemByObj as whAddItem, AddSpiritStone as whAddSpiritStone } from '../../model/Cache/player/Warehouse.js';

export default class MoneyOperation extends plugin {
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
                }
            ]
        });
    }

    GiveSpiritStone = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        }

        const giverId = e.user_id;
        const doneeId = getAtUid(e);

        if (doneeId == undefined || !await CheckStatu({ user_id: doneeId }, StatuLevel.exist, false)) {
            e.reply("获赠者不存在！");
            return;
        }

        if (doneeId == giverId) {
            e.reply("请不要赠送给自己！");
            return;
        }

        const count = Math.max(forceNumber(e.msg.replace('#赠送灵石', '')), 1);
        if ((await GetSpiritStoneCount(giverId)) < count) {
            e.reply([segment.at(giverId), `似乎没有${count}灵石.`]);
            return;
        }

        bpAddSpiritStone(giverId, -count);
        whAddSpiritStone(doneeId, count);
        e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${count}灵石.`]);
    }

    GiveProp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        }

        const giverId = e.user_id;
        const doneeId = await getAtUid(e);

        if (doneeId == undefined || !await CheckStatu({ user_id: doneeId }, StatuLevel.exist, false)) {
            e.reply("获赠者不存在！");
            return;
        }

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
