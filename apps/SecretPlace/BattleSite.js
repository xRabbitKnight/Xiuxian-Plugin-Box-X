import plugin from '../../../../lib/plugins/plugin.js';
import config from '../../model/Config.js';
import { Read_action, ForwardMsg} from '../Xiuxian/Xiuxian.js';
import { PVE } from '../../model/Battle/Battle.js';
import MonsterMgr from '../../model/Region/MonsterMgr.js';
import BattleVictory from '../../model/RandomEvent/BattleVictory.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { CheckCD } from '../../model/CD/CheckCD.js';
import { AddActionCD } from '../../model/CD/AddCD.js';

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
                    fnc: 'Exploremonsters'
                }
            ]
        });
        this.xiuxianConfigData = config.getConfig('xiuxian', 'xiuxian');
    };
    Kill = async (e) => {
        if (!CheckStatu(e, StatuLevel.canBattle)) {
            return;
        };

        if(CheckCD(e, 'Kill')){
            return;
        }
        
        const usr_qq = e.user_id;
        const monsterName = e.msg.replace('#击杀', '');
        const action = await Read_action(usr_qq);
        const monsters = MonsterMgr.GetMonsters(action.region);
        const targetMonster = monsters.find(item => item.name == monsterName);
        if (!targetMonster) {
            e.reply(`这里没有${monsterName},去别处看看吧`);
            return;
        };
        const msg = [`${usr_qq}的[击杀结果]\n注:怪物每1小时刷新`];
        const battleResult = await PVE(e, targetMonster, msg);
        if(battleResult){
            msg.push(`采集出售从${targetMonster.name}获取的战利品，你获得了${targetMonster.level * 100}灵石`);
            await BattleVictory.TriggerEvent(e, targetMonster, msg);
        }
            
        await AddActionCD(e, 'Kill');
        await ForwardMsg(e, msg);
        return;
    };

    Exploremonsters = async (e) => {
        if (!CheckStatu(e, StatuLevel.inAction)) {
            return;
        };

        const usr_qq = e.user_id;
        const action = await Read_action(usr_qq);
        const msg = [];
        const monsters = MonsterMgr.GetMonsters(action.region);
        monsters.forEach((item) => {
            msg.push(
                '怪名:' + item.name + '\n' +
                '等级:' + item.level + '\n'
            );
        });
        await ForwardMsg(e, msg);
        return;
    };
};