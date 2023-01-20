import plugin from '../../../../lib/plugins/plugin.js';
import { AddPercentBlood } from '../../model/Cache/player/Battle.js'
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { AddItemByObj, GetItemByName } from '../../model/Cache/player/Backpack.js';
import { AddExp, AddBodyExp } from '../../model/Cache/player/Level.js';
import { AddManual, DelManual } from '../../model/Cache/player/Talent.js';
import { AddSkill, DelSkill } from '../../model/Cache/player/Skill.js';
import { clamp, forceNumber } from '../../model/mathCommon.js';

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
                    fnc: 'ConsumePellet'
                },
                {
                    reg: '^#学习技能.*$',
                    fnc: 'LearnSkill'
                },
                {
                    reg: '^#忘掉技能.*$',
                    fnc: 'ForgetSkill'
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

    ConsumePellet = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        let [name, count] = e.msg.replace('#服用', '').split('*');
        count = forceNumber(count);

        const pellet = await GetItemByName(e.user_id, name);
        if (pellet == undefined || pellet.acount < count) {
            e.reply(`没有${name} * ${count}`);
            return;
        }

        if (pellet.id[0] != '4') {
            e.reply(`不可服用${name}`);
            return;
        }

        if (pellet.id[2] == '1') {
            AddPercentBlood(e.user_id, pellet.blood * count);
            e.reply(`血量恢复${clamp(pellet.blood * count, 1, 100)}%`);
        }
        else if (pellet.id[2] == '2') {
            AddExp(e.user_id, pellet.experience * count);
            e.reply(`修为增加${pellet.experience * count}`);
        }
        else if (pellet.id[2] == '3') {
            AddBodyExp(e.user_id, pellet.experiencemax * count)
            e.reply(`气血增加${pellet.experiencemax * count}`);
        }

        AddItemByObj(e.user_id, pellet, -count);
    }

    LearnSkill = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        const name = e.msg.replace('#学习技能', '');
        const skillBook = await GetItemByName(e.user_id, `技能书：${name}`);
        if (skillBook == undefined) {
            e.reply(`没有[技能书：${name}]`);
            return;
        }

        if (skillBook.id[0] != '7') {
            e.reply(`${name}不是技能书`);
            return;
        }

        if (!await AddSkill(e.user_id, skillBook)) {
            e.reply('学不会，怎么看都学不会！');
            return;
        }

        AddItemByObj(e.user_id, skillBook, -1);
        e.reply(`学习技能${name}`);
    }

    ForgetSkill = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        const name = e.msg.replace('#忘掉技能', '');
        if (!await DelSkill(e.user_id, name)) {
            e.reply(`没学过${name}`);
            return;
        }

        e.reply(`忘了${name}`);
    }

    LearnManual = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
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
        if (!await CheckStatu(e, StatuLevel.alive)) {
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