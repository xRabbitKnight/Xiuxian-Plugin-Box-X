import * as util from '../../model/utility.js';
import * as CD from '../../model/CD/Action.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { GetPlayerRegion } from '../../model/Cache/player/Action.js';
import { PVP } from '../../model/Battle/Battle.js';
import { ForwardMsg } from '../Xiuxian/Xiuxian.js';

export default class Battle extends plugin {
    constructor() {
        super({
            name: 'Battle',
            dsc: 'Battle',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#攻击.*$',
                    fnc: 'Attack'
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

        const targetId = util.getAtUid(e);
        if(targetId == undefined || !await CheckStatu(e, StatuLevel.exist, false)){
            e.reply(`请不要攻击未进仙道之人！`);
            return;
        }

        const attackId = e.user_id;
        if(await GetPlayerRegion(attackId) != await GetPlayerRegion(targetId)){
            e.reply(`本区域找不到此人！`);
            return;
        }

        if(!await CheckStatu({user_id : targetId}, StatuLevel.canBattle, false)){
            e.reply(`玩家(uid : ${targetId}) 当前状态不可进行战斗！`);
            return;
        }

        const msg = ['战斗记录'];
        const result = await PVP(e, targetId, msg);
        ForwardMsg(e, msg);

        CD.AddActionCD(e.user_id, 'attack');
    }
}