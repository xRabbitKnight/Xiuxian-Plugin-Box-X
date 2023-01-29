/*
 * @described : 玩家等级
 */

import data from '../../model/System/data.js';
import config from '../../model/System/config.js';
import * as CD from '../../model/CD/Action.js';
import { segment } from 'oicq';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { AddExp, AddBodyExp, GetLevel, SetLevel } from '../../model/Cache/player/Level.js';
import { AddPowerByLevelUp, AddBloodToPercent } from '../../model/Cache/player/Battle.js';
import { AddLife } from '../../model/Cache/player/Life.js';
import { GetTalentBuff } from '../../model/Cache/player/Talent.js';

const RankName = ["初期", "中期", "后期", "巅峰", "圆满"];

export default class level extends plugin {
    constructor() {
        super({
            name: 'level',
            dsc: '玩家等级相关指令',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#闭关$',
                    fnc: 'InSeclusion'
                },
                {
                    reg: '^#出关$',
                    fnc: 'OutSeclusion'
                },
                {
                    reg: '^#突破$',
                    fnc: 'LevelUp'
                },
                {
                    reg: '^#降妖$',
                    fnc: 'StartExercise'
                },
                {
                    reg: '^#归来$',
                    fnc: 'EndExercise'
                },
                {
                    reg: '^#破体$',
                    fnc: 'BodyLevelUp'
                }
            ]
        });
    }

    InSeclusion = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        const action = { actionName: '闭关', startTime: new Date().getTime() };
        redis.set(`xiuxian:player:${e.user_id}:action`, JSON.stringify(action));
        e.reply('开始两耳不闻窗外事...');
    }


    OutSeclusion = async (e) => {
        if (!await CheckStatu(e, StatuLevel.aliveAndInGroup)) {
            return;
        }

        let action = await redis.get(`xiuxian:player:${e.user_id}:action`);
        if (action == undefined || (action = JSON.parse(action)).actionName != '闭关') {
            return;
        }
        redis.del(`xiuxian:player:${e.user_id}:action`);

        const cfg = config.GetConfig('game/player.yaml').seclusion;
        const time = Math.floor((new Date().getTime() - action.startTime) / 60000);
        if (time < cfg.minTime) {
            e.reply('只是呆了一会儿...');
            return;
        }

        const buff = (await GetTalentBuff(e.user_id)) / 100 + 1;
        const exp = Math.floor(cfg.efficiency * buff * time);

        AddExp(e.user_id, exp);
        AddBloodToPercent(e.user_id, 100);
        e.reply([segment.at(e.user_id), `闭关结束,修为提升了${exp}\n血量恢复至100%`]);
    }

    LevelUp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canLevelUp)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'levelUp', e.reply)) {
            return;
        }

        const player = await GetLevel(e.user_id);

        if (player.level >= 10) {
            e.reply('您已经到达巅峰！');
            return;
        }

        const list = data.levelList;
        if (player.exp < list[player.level - 1].exp) {
            e.reply(`修为不足,再积累${list[player.level - 1].exp - player.exp}修为后方可突破`);
            return;
        }

        const failureProb = -0.4 + player.level * 0.1; //突破失败概率
        if (Math.random() < failureProb) {
            const loss = Math.floor(list[player.level - 1].exp * Math.random());
            AddExp(e.user_id, -loss);
            e.reply(`突破失败，你损失了${loss}修为！`);
            return;
        }

        //突破成功
        const MAXRANK = 5;
        player.exp -= list[player.level - 1].exp;

        player.rank += 1;
        player.level += Math.floor(player.rank / MAXRANK);
        player.rank %= MAXRANK;

        player.levelName = list[player.level - 1].name;


        SetLevel(e.user_id, player);
        e.reply(`突破成功至${player.levelName}${RankName[player.rank]}！`);

        //大境界突破，更新面板，增加寿命
        if (player.rank == 0) {
            AddPowerByLevelUp(e.user_id, list, player.level);
            AddLife(e.user_id, list[player.level - 1].exp);
            e.reply(`寿命增加${list[player.level - 1].exp}`);
        }
        CD.AddActionCD(e.user_id, 'levelUp');
    }


    StartExercise = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canBattle)) {
            return;
        }

        const action = { actionName: '降妖', startTime: new Date().getTime() };
        redis.set(`xiuxian:player:${e.user_id}:action`, JSON.stringify(action));
        e.reply('开始外出...');
    }

    EndExercise = async (e) => {
        if (!await CheckStatu(e, StatuLevel.aliveAndInGroup)) {
            return;
        }

        let action = await redis.get(`xiuxian:player:${e.user_id}:action`);
        if (action == undefined || (action = JSON.parse(action)).actionName != '降妖') {
            return;
        }
        redis.del(`xiuxian:player:${e.user_id}:action`);

        const cfg = config.GetConfig('game/player.yaml').exercise;
        const time = Math.floor((new Date().getTime() - action.startTime) / 60000);
        if (time < cfg.minTime) {
            e.reply('才外出一会儿...');
            return;
        }

        const buff = (await GetTalentBuff(e.user_id)) / 100 + 1;
        const exp = Math.floor(cfg.efficiency * buff * time);

        AddBodyExp(e.user_id, exp);
        AddBloodToPercent(e.user_id, 90);
        e.reply([segment.at(e.user_id), `降妖归来,气血上升了${exp}\n血量恢复至90%`]);
    }

    BodyLevelUp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canLevelUp)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'bodyLevelUp', e.reply)) {
            return;
        }

        const player = await GetLevel(e.user_id);

        if (player.bodyLevel >= 10) {
            e.reply('您已经到达巅峰！');
            return;
        }

        const list = data.bodyLevelList;
        if (player.bodyExp < list[player.bodyLevel - 1].exp) {
            e.reply(`气血不足,再积累${list[player.bodyLevel - 1].exp - player.bodyExp}气血后方可突破`);
            return;
        }

        const failureProb = -0.4 + player.bodyLevel * 0.1; //突破失败概率
        if (Math.random() < failureProb) {
            const loss = Math.floor(list[player.bodyLevel - 1].exp * Math.random());
            AddBodyExp(e.user_id, -loss);
            e.reply(`突破失败，你损失了${loss}气血！`);
            return;
        }

        //突破成功
        const MAXRANK = 5;
        player.bodyExp -= list[player.bodyLevel - 1].exp;

        player.bodyRank += 1;
        player.bodyLevel += Math.floor(player.bodyRank / MAXRANK);
        player.bodyRank %= MAXRANK;

        player.bodyLevelName = list[player.bodyLevel - 1].name;

        SetLevel(e.user_id, player);
        e.reply(`突破成功至${player.bodyLevelName}${RankName[player.bodyRank]}`);

        //大境界突破，更新面板
        if (player.bodyRank == 0) {
            AddPowerByLevelUp(e.user_id, list, player.bodyLevel);
        }
        CD.AddActionCD(e.user_id, 'bodyLevelUp');
    }
}