import data from '../../model/System/data.js';
import * as CD from '../../model/CD/Action.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { AddExp, AddExpMax, GetLevelInfo, SetLevelInfo } from '../../model/Cache/player/Level.js';
import { AddPowerByLevelUp } from '../../model/Cache/player/Battle.js';
import { AddLife } from '../../model/Cache/player/Life.js';

const RankName = ["初期", "中期", "后期", "巅峰", "圆满"];

export default class Level extends plugin {
    constructor() {
        super({
            name: 'Level',
            dsc: 'Level',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#突破$',
                    fnc: 'LevelUp'
                },
                {
                    reg: '^#破体$',
                    fnc: 'BodyLevelUp'
                },
                {
                    reg: '^#渡劫$',
                    fnc: 'fate_up'
                },
                {
                    reg: '^#羽化登仙$',
                    fnc: 'Level_up_Max'
                },
            ]
        });
    }

    BodyLevelUp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canLevelUp)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'bodyLevelUp', e.reply)) {
            return;
        }

        const player = await GetLevelInfo(e.user_id);

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
            AddExpMax(e.user_id, -loss);
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

        SetLevelInfo(e.user_id, player);
        e.reply(`突破成功至${player.bodyLevelName}${RankName[player.bodyRank]}`);

        //大境界突破，更新面板
        if(player.bodyRank == 0){   
            AddPowerByLevelUp(e.user_id, list, player.bodyLevel);
        }
        CD.AddActionCD(e.user_id, 'bodyLevelUp');
    }

    LevelUp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canLevelUp)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'levelUp', e.reply)) {
            return;
        }

        const player = await GetLevelInfo(e.user_id);

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

        
        SetLevelInfo(e.user_id, player);
        e.reply(`突破成功至${player.levelName}${RankName[player.rank]}！`);
        
        //大境界突破，更新面板，增加寿命
        if(player.rank == 0){   
            AddPowerByLevelUp(e.user_id, list, player.level);
            AddLife(e.user_id, list[player.level - 1].exp);
            e.reply(`寿命增加${list[player.level - 1].exp}`);
        }
        CD.AddActionCD(e.user_id, 'levelUp');
    }
}