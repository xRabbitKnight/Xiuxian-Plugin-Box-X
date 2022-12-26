import plugin from '../../../../lib/plugins/plugin.js';
import MonsterMgr from '../../model/Region/MonsterMgr.js';
import BattleVictory from '../../model/RandomEvent/BattleVictory.js';
import { PVE } from '../../model/Battle/Battle.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { CheckCD } from '../../model/CD/CheckCD.js';
import { AddActionCD } from '../../model/CD/AddCD.js';
import { ForwardMsg } from '../Xiuxian/Xiuxian.js';
import { GetPlayerRegion } from '../../model/Cache/Action.js';

export class BattleSite extends plugin {
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
    };

    Kill = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canBattle)) {
            return;
        };

        if (await CheckCD(e, 'Kill')) {
            return;
        }

        const monsterName = e.msg.replace('#击杀', '');
        const targetMonster = MonsterMgr.GetMonsters(await GetPlayerRegion(e.user_id)).find(item => item.name == monsterName);
        if (!targetMonster) {
            e.reply(`这里没有${monsterName},去别处看看吧`);
            return;
        };

        const msg = [`${e.sender.nickname}的[击杀结果]\n注:怪物每1小时刷新`];
        const battleResult = await PVE(e, targetMonster, msg);
        if (battleResult) {
            msg.push(`采集出售从${targetMonster.name}获取的战利品，你获得了${targetMonster.level * 100}灵石`);
            await BattleVictory.TriggerEvent(e, targetMonster, msg);
        }

        AddActionCD(e, 'Kill');
        ForwardMsg(e, msg);
        return;
    };

    ExploreMonsters = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        };

        const monsters = MonsterMgr.GetMonsters(await GetPlayerRegion(e.user_id));
        const msg = [];
        monsters.forEach(monster => msg.push(`怪名:${monster.name}\n等级:${monster.level}`));
        ForwardMsg(e, msg);
    };
};