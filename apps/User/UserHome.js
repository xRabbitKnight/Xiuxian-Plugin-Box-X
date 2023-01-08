import plugin from '../../../../lib/plugins/plugin.js';
import { AddPercentBlood } from '../../model/Cache/player/Battle.js'
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { AddItemByObj, GetItemByName } from '../../model/Cache/player/Backpack.js';
import { AddExp, AddExpMax } from '../../model/Cache/player/Level.js';
import { AddManual, DelManual } from '../../model/Cache/player/Talent.js';

export default class UserHome extends plugin {
    constructor() {
        super({
            name: 'UserHome',
            dsc: 'UserHome',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#服用.*$',
                    fnc: 'consumePellet'
                },
                {
                    reg: '^#学习.*$',
                    fnc: 'LearnManual'
                },
                {
                    reg: '^#忘掉.*$',
                    fnc: 'ForgetManual'
                }
            ]
        })
    }

    consumePellet = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }

        const name = e.msg.replace('#服用', '');
        const pellet = await GetItemByName(e.user_id, name);
        if (pellet == undefined) {
            e.reply(`没有${name}`);
            return;
        }

        if (pellet.id[0] != '4') {
            e.reply(`不可服用${name}`);
            return;
        }

        if (pellet.id[2] == '1') {
            AddPercentBlood(e.user_id, pellet.blood);
            e.reply(`血量恢复${pellet.blood}%`);
        }
        else if (pellet.id[2] == '2') {
            AddExp(e.user_id, pellet.experience);
            e.reply(`修为增加${pellet.experience}`);
        }
        else if (pellet.id[2] == '3') {
            AddExpMax(e.user_id, pellet.experiencemax)
            e.reply(`气血增加${pellet.experiencemax}`);
        }

        AddItemByObj(e.user_id, pellet, -1);
    }

    LearnManual = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }

        const name = e.msg.replace('#学习', '');
        const manual = await GetItemByName(e.user_id, name);
        if (manual == undefined) {
            e.reply(`没有[${name}]`);
            return;
        }

        if (manual.id[0] != '5') {
            e.reply(`${name}不是功法`);
            return;
        }

        if (!await AddManual(e.user_id, manual)) {
            e.reply('你反复看了又看,却怎么也学不进');
            return;
        }

        AddItemByObj(e.user_id, manual, -1);
        e.reply(`学习${name}`);
    }

    ForgetManual = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }

        const name = e.msg.replace('#忘掉', '');
        if (!await DelManual(e.user_id, name)) {
            e.reply(`没学过${name}`);
            return;
        }

        e.reply(`忘了${name}`);
    }
}