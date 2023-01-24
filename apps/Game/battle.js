/*
 * @described : 玩家战斗
 */

import MonsterMgr from '../../model/Region/MonsterMgr.js';
import BattleVictory from '../../model/RandomEvent/BattleVictory.js';
import * as CD from '../../model/CD/Action.js';
import { PVE, PVP } from '../../model/Battle/Battle.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { GetPlayerRegion } from '../../model/Cache/player/Action.js';
import { GetDrops } from '../../model/Battle/BattleDrop.js';
import { replyForwardMsg, getAtUid } from '../../model/util/gameUtil.js';

export default class battle extends plugin {
    constructor() {
        super({
            name: 'battle',
            dsc: '玩家战斗相关指令',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#攻击.*$',
                    fnc: 'Attack'
                },
                {
                    reg: '^#击杀.*$',
                    fnc: 'Kill'
                },
                {
                    reg: '^#探索怪物$',
                    fnc: 'ExploreMonsters'
                }
            ]
        });
    }

    Attack = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canBattle)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'attack', e.reply)) {
            return;
        }

        const attackId = e.user_id;
        const targetId = getAtUid(e);

        if (targetId == undefined || !await CheckStatu(e, StatuLevel.exist, false)) {
            e.reply(`请不要攻击未进仙道之人！`);
            return;
        }

        if (await GetPlayerRegion(attackId) != await GetPlayerRegion(targetId)) {
            e.reply(`本区域找不到此人！`);
            return;
        }

        if (!await CheckStatu({ user_id: targetId }, StatuLevel.canBattle, false)) {
            e.reply(`玩家(uid : ${targetId}) 当前状态不可进行战斗！`);
            return;
        }

        const msg = ['【战斗记录】'];
        //暂时未做pvp惩罚，乱打一通欢乐多
        const result = await PVP(e, targetId, msg);
        replyForwardMsg(e, msg);

        CD.AddActionCD(e.user_id, 'attack');
    }

    Kill = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canBattle)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'kill', e.reply)) {
            return;
        }

        const monsterName = e.msg.replace('#击杀', '');
        const targetMonster = MonsterMgr.GetMonsters(await GetPlayerRegion(e.user_id)).find(item => item.name == monsterName);
        if (!targetMonster) {
            e.reply(`这里没有${monsterName},去别处看看吧`);
            return;
        }

        const msg = [`${e.sender.nickname}的[击杀结果]\n注:怪物每1小时刷新`];
        const battleResult = await PVE(e, targetMonster, msg);
        if (battleResult) {
            await GetDrops(e.user_id, targetMonster, msg);
            await BattleVictory.TriggerEvent(e, targetMonster, msg);
        }

        CD.AddActionCD(e.user_id, 'kill');
        replyForwardMsg(e, msg);
    }

    ExploreMonsters = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        const monsters = MonsterMgr.GetMonsters(await GetPlayerRegion(e.user_id));
        const msg = [];
        monsters.forEach(monster => msg.push(`怪名:${monster.name}\n等级:${monster.level}`));
        replyForwardMsg(e, msg);
    }
}
