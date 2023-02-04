/*
 * @described : 玩家学习功法、技能
 */

import * as CD from '../../model/CD/Action.js'
import { AddPercentBlood } from '../../model/Cache/player/Battle.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { AddItemByObj, GetItemByName } from '../../model/Cache/player/Backpack.js';
import { AddExp, AddBodyExp, GetLevel } from '../../model/Cache/player/Level.js';
import { AddManual, AddManualBuff, DelManual } from '../../model/Cache/player/Talent.js';
import { AddSkill, DelSkill } from '../../model/Cache/player/Skill.js';
import { clamp, forceNumber, rand } from '../../model/util/math.js';
import { GetItemReg } from '../../model/Cache/item/Item.js';
import { UseProp } from '../../model/Prop/base.js';
import { replyForwardMsg } from '../../model/util/gameUtil.js';
import { CheckSensitiveWord } from '../../model/util/sensitive.js';

export default class learn extends plugin {
    constructor() {
        super({
            name: 'learn',
            dsc: '学习相关指令',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#服用.*$',
                    fnc: 'ConsumePellets'
                },
                {
                    reg: '^#使用.*$',
                    fnc: 'UseProps'
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
                    reg: '^#学习功法.*$',
                    fnc: 'LearnManual'
                },
                {
                    reg: '^#自创功法.*$',
                    fnc: 'CreateManual'
                },
                {
                    reg: '^#忘掉功法.*$',
                    fnc: 'ForgetManual'
                },
                {
                    reg: '^#钻研功法.*$',
                    fnc: 'PlumbManual'
                }
            ]
        })
    }

    ConsumePellets = async (e) => {
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
            AddBodyExp(e.user_id, pellet.experiencemax * count);
            e.reply(`气血增加${pellet.experiencemax * count}`);
        }

        AddItemByObj(e.user_id, pellet, -count);
    }

    UseProps = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        let [name, count] = e.msg.replace('#使用', '').split('*');
        count = forceNumber(count);

        const prop = await GetItemByName(e.user_id, name);
        if (prop == undefined || prop.acount < count) {
            e.reply(`没有${name} * ${count}`);
            return;
        }

        if (!GetItemReg('道具')?.test(prop.id)) {
            e.reply(`不可使用${name}`);
            return;
        }

        const msg = [];
        for (let i = 0; i < count; ++i) {
            if (await UseProp(name, e.user_id, msg)) {
                msg.push(`道具${name}使用成功.`);
                continue;
            }
            //使用失败，发生错误
            return;
        }

        replyForwardMsg(e, msg);
        AddItemByObj(e.user_id, prop, -count);
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

        if (!GetItemReg('技能书')?.test(skillBook.id)) {
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

        const name = e.msg.replace('#学习功法', '');
        const manual = await GetItemByName(e.user_id, name);
        if (manual == undefined) {
            e.reply(`没有[${name}]`);
            return;
        }

        if (!GetItemReg('功法')?.test(manual.id)) {
            e.reply(`${name}不是功法`);
            return;
        }

        if (!await AddManual(e.user_id, manual)) {
            e.reply('你反复看了又看,却怎么也学不进');
            return;
        }

        AddItemByObj(e.user_id, manual, -1);
        e.reply(`学习功法『${name} 』！`);
    }

    CreateManual = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        if(await CD.IfActionInCD(e.user_id, 'createManual', e.reply)){
            return;
        }

        const levelInfo = await GetLevel(e.user_id);
        const expCost = 10000 * levelInfo.level;

        if(expCost > levelInfo.exp){
            e.reply(`修为不足，无法自创功法！`);
            return;
        }
 
        const manualName = e.msg.replace('#自创功法', '');
        if(CheckSensitiveWord(manualName)){
            e.reply(`请文明修仙！`);
            return;
        }

        const manual = {
            name : manualName,
            size : levelInfo.level * 10 + rand(0, 9)
        }

        if (!await AddManual(e.user_id, manual)) {
            e.reply('自创功法失败');
            return;
        }

        AddExp(e.user_id, -expCost);
        e.reply(`你成功自创功法『${manualName} 』！`);
        CD.AddActionCD(e.user_id, 'createManual');
    }

    ForgetManual = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        const name = e.msg.replace('#忘掉功法', '');
        if (!await DelManual(e.user_id, name)) {
            e.reply(`没学过功法『${name} 』`);
            return;
        }

        e.reply(`忘了功法『${name} 』.`);
    }

    PlumbManual = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'plumbManual', e.reply)) {
            return;
        }

        const name = e.msg.replace('#钻研功法', '');
        if (!await AddManualBuff(e.user_id, name)) {
            e.reply(`没学过功法『${name} 』`);
            return;
        }

        CD.AddActionCD(e.user_id, 'plumbManual');
        e.reply(`钻研功法『${name} 』成功！`);
    }
}