import config from '../../../model/System/config.js';
import { AddItemByObj, AddItemsByObj, GetBackpackInfo, SetBackpackInfo } from '../../../model/Cache/player/Backpack.js';
import { AddPercentBlood, GetBattleInfo } from '../../../model/Cache/player/Battle.js';
import { AddBodyExp, AddExp } from '../../../model/Cache/player/Level.js';
import { CheckStatu, StatuLevel } from '../../../model/Statu/Statu.js';
import { replyForwardMsg } from '../../../model/util/gameUtil.js';
import { clamp, forceNumber } from '../../../model/util/math.js';
import { filterItemsByName, listItems } from '../model/utils.js';
import { AddManual, DelManual, GetTalentInfo } from '../../../model/Cache/player/Talent.js';
import { AddSkill, DelSkill } from '../../../model/Cache/player/Skill.js';

export default class EasyHome extends plugin {
    constructor() {
        super({
            name: 'EasyHome',
            dsc: 'Easy commands for user home',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#快捷恢复',
                    fnc: 'easyQueryBlood'
                },
                {
                    reg: '^#快捷恢复[0-9]+%$',
                    fnc: 'easyRecover'
                },
                {
                    reg: '^#快捷服用(修为|气血)药$',
                    fnc: 'easyAddExp'
                },
                {
                    reg: '^#快捷学习(功法|技能)$',
                    fnc: 'easyLearn'
                }
            ]
        })
    }

    easyQueryBlood = async (e) => {
        const battleInfo = await GetBattleInfo(e.user_id);
        const nowbloodPercent = Math.floor(battleInfo.nowblood / battleInfo.blood * 100);
        e.reply(`当前血量 [${nowbloodPercent}%]:\n ${battleInfo.nowblood} / ${battleInfo.blood}`);
    }

    easyRecover = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        let backpack = await GetBackpackInfo(e.user_id);
        let {included, excluded} = await filterItemsByName('恢复药', backpack.items);

        if (included.length < 1) {
            e.reply('背包里没有恢复药！');
            return;
        }

        let expectedBlood = clamp(forceNumber(e.msg.slice(5, -1)), 0, 200);
        let {recoverPlan, recoverBlood} = getRecoverPlan(included, expectedBlood, true);

        if (recoverBlood < 1) {
            e.reply('没有合适的恢复药搭配方案！');
            return;
        }

        AddItemsByObj(e.user_id, recoverPlan);
        AddPercentBlood(e.user_id, recoverBlood);

        let replyStr = `血量恢复${recoverBlood}%`;
        recoverPlan.forEach(item => {
            replyStr += `\n${item.name} (${item.blood}%) ${item.acount}`
        });
        e.reply(replyStr);
    }

    easyAddExp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        let itemName = e.msg.substr(5);
        let backpack = await GetBackpackInfo(e.user_id);
        let {included, excluded} = await filterItemsByName(itemName, backpack.items);

        if (included.length < 1) {
            e.reply(`你没有可以服用的[${itemName}]！`);
            return;
        }

        let totolExp = 0, msgList;
        if (itemName == '修为药') {
            included.forEach(item => {
                totolExp += item.experience * item.acount;
            });
            AddExp(e.user_id, totolExp);
            msgList = listItems(`修为增加${totolExp}`, included);
        } else if (itemName == '气血药') {
            included.forEach(item => {
                totolExp += item.experiencemax * item.acount;
            });
            AddBodyExp(e.user_id, totolExp);
            msgList = listItems(`气血增加${totolExp}`, included);
        }
        replyForwardMsg(e, msgList);

        backpack.items = excluded;
        SetBackpackInfo(e.user_id, backpack);
    }

    easyLearn = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }
        
        let type = e.msg.substr(5)=='功法' ? '功法' : '技能书';
        logger.info(type);
        let backpack = await GetBackpackInfo(e.user_id);
        let {included, excluded} = await filterItemsByName(type, backpack.items);

        if (included.length < 1) {
            e.reply(`背包里没有${type}！`);
            return;
        }

        let replyStr = '', learnNum = 0;
        if (type == '功法') {
            await getManualPlan(e.user_id, included);
        } else if (type == '技能书') {
            for (let item of included) {
                if (await AddSkill(e.user_id, item)) {
                    AddItemByObj(e.user_id, item, -1);
                    replyStr += `\n学习技能『${item.name.substr(4)}』`;
                    learnNum++;
                }
            }
        }
        
        if (learnNum == 0) {
            replyStr = `背包里没有可以学习的${type}！`;
        } else {
            replyStr = `共使用${learnNum}本${type}` + replyStr;
        }
        e.reply(replyStr);
    }
}

function getRecoverPlan(recoverItems, V, minus=false) {
    let dp = new Array(V+5).fill(0);
    let plan = new Array(V+5).fill(new Array(recoverItems.length).fill(0));
    
    recoverItems.forEach((item, index, self) => {
        let v = item.blood;
        let w = item.blood;
        let s = item.acount;
        for (let j=V; j>=v; j--) {
            for (let k=1; k<=s && k*v<=j; k++) {
                if (dp[j] <= dp[j-k*v] + k*w) {
                    dp[j] = dp[j-k*v] + k*w;
                    plan[j] = Object.assign([], plan[j-k*v]);
                    plan[j][index] = k;
                }
            }
        }
    })

    let recoverPlan = [];
    plan[V].forEach((num, index, self) => {
        if (num > 0) {
            let item = Object.assign({}, recoverItems[index]);
            item.acount = minus ? -num : num;
            recoverPlan.push(item);
        }
    })
    return {recoverPlan, recoverBlood:dp[V]};
}

async function getManualPlan(user_id, manualItems) {
    let maxLearnNum = config.GetConfig('game/player.yaml').maxManual;
    let talentInfo = await GetTalentInfo(user_id);
    
    // if (await AddManual(user_id, item)) {
    //     AddItemByObj(e.user_id, item, -1);
    //     replyStr += `\n学习功法『${item.name}』`;
    //     learnNum++;
    // }
}