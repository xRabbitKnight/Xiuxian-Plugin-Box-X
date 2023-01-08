import plugin from '../../../../lib/plugins/plugin.js';
import MonsterMgr from '../../model/Region/MonsterMgr.js';
import BattleVictory from '../../model/RandomEvent/BattleVictory.js';
import { PVE } from '../../model/Battle/Battle.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { CheckCD } from '../../model/CD/CheckCD.js';
import { AddActionCD } from '../../model/CD/AddCD.js';
import { ForwardMsg } from '../Xiuxian/Xiuxian.js';
import { GetPlayerRegion } from '../../model/Cache/player/Action.js';
import { GetDrops } from '../../model/Battle/BattleDrop.js';

export default class BattleSite extends plugin {
    constructor() {
        super({
            name: 'BattleSite',
            dsc: 'BattleSite',
            event: 'message',
            priority: 600,
            rule: [
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

    Kill = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canBattle)) {
            return;
        }

        if (await CheckCD(e, 'kill')) {
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
            BattleVictory.TriggerEvent(e, targetMonster, msg);
        }

        AddActionCD(e, 'kill');
        ForwardMsg(e, msg);
    }

    ExploreMonsters = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        const monsters = MonsterMgr.GetMonsters(await GetPlayerRegion(e.user_id));
        const msg = [];
        monsters.forEach(monster => msg.push(`怪名:${monster.name}\n等级:${monster.level}`));
        ForwardMsg(e, msg);
    }
}