import config from '../../model/System/config.js';
import { segment } from 'oicq';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { GetTalentBuff } from '../../model/Cache/player/Talent.js';
import { AddExp, AddExpMax } from '../../model/Cache/player/Level.js';
import { AddBloodToPercent } from '../../model/Cache/player/Battle.js';

export default class PlayerControl extends plugin {
    constructor() {
        super({
            name: 'PlayerControl',
            dsc: 'PlayerControl',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '#降妖$',
                    fnc: 'StartExercise'
                },
                {
                    reg: '#闭关$',
                    fnc: 'InSeclusion'
                },
                {
                    reg: '^#出关$',
                    fnc: 'OutSeclusion'
                },
                {
                    reg: '^#归来$',
                    fnc: 'EndExercise'
                }
            ]
        });
    }

    InSeclusion = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        const action = { 'actionName': '闭关', 'startTime': new Date().getTime() };
        redis.set(`xiuxian:player:${e.user_id}:action`, JSON.stringify(action));
        e.reply('开始两耳不闻窗外事...');
    }

    StartExercise = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canBattle)) {
            return;
        }

        const action = { 'actionName': '降妖', 'startTime': new Date().getTime() };
        redis.set(`xiuxian:player:${e.user_id}:action`, JSON.stringify(action));
        e.reply('开始外出...');
    };

    OutSeclusion = async (e) => {
        if (!await CheckStatu(e, StatuLevel.existAndInGroup)) {
            return;
        }

        let action = await redis.get(`xiuxian:player:${e.user_id}:action`);
        if (action == undefined || (action = JSON.parse(action)).actionName != '闭关') {
            return;
        }
        redis.del(`xiuxian:player:${e.user_id}:action`);

        const cfg = config.GetConfig('game/player.yaml');
        const time = Math.floor((new Date().getTime() - action.startTime) / 60000);
        if (time < cfg.seclusion.minTime) {
            e.reply('只是呆了一会儿...');
            return;
        }

        const buff = (await GetTalentBuff(e.user_id)) / 100 + 1;
        const exp = Math.floor(cfg.seclusion.efficiency * buff * time);

        AddExp(e.user_id, exp);
        AddBloodToPercent(e.user_id, 100);
        e.reply([segment.at(e.user_id), `闭关结束,修为提升了${exp}\n血量恢复至100%`]);
    }

    EndExercise = async (e) => {
        if (!await CheckStatu(e, StatuLevel.existAndInGroup)) {
            return;
        }

        let action = await redis.get(`xiuxian:player:${e.user_id}:action`);
        if (action == undefined || (action = JSON.parse(action)).actionName != '降妖') {
            return;
        }
        redis.del(`xiuxian:player:${e.user_id}:action`);

        const cfg = config.GetConfig('game/player.yaml');
        const time = Math.floor((new Date().getTime() - action.startTime) / 60000);
        if (time < cfg.exercise.minTime) {
            e.reply('才外出一会儿...');
            return;
        }

        const buff = (await GetTalentBuff(e.user_id)) / 100 + 1;
        const exp = Math.floor(cfg.exercise.efficiency * buff * time);

        AddExpMax(e.user_id, exp);
        AddBloodToPercent(e.user_id, 90);
        e.reply([segment.at(e.user_id), `降妖归来,气血上升了${exp}\n血量恢复至90%`]);
    }
}