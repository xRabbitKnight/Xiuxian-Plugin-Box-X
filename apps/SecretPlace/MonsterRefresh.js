import plugin from "../../../../lib/plugins/plugin.js";
import { GetBattleInfo, RefreshBattleInfo, SetBattleInfo } from "../../model/Cache/player/Battle.js";
import { GetLevelInfo } from "../../model/Cache/player/Level.js";
import { forceNumber } from "../../model/mathCommon.js";
import data from "../../model/XiuxianData.js"
import { RefreshBoss, RefreshMonster } from "../../model/Region/Region.js";
import { GetAllUid } from "../../model/Cache/player/players.js";

//TODO: 这玩意应该扔到配置里
const CRON_REFREASH_MONSTER = '0 0 0/1 * * ?';
const CRON_REFREASH_BOSS = '0 0 0/12 * * ?';

export class MonsterRefresh extends plugin {
    constructor() {
        super({
            name: "刷新怪物",
            dsc: "定时刷新每个区域的怪物",
            event: 'message',
            priority: 300,
            rule: [
                {
                    reg: '^#刷新boss$',
                    fnc: 'refreshBoss',
                    permission: 'master'
                },
                {
                    reg: '^#刷新玩家基础面板$',
                    fnc: 'refreshPlayerBase',
                    permission: 'master'
                }
            ]
        });
        this.task = [
            {
                name: "定时刷新怪物",
                cron: CRON_REFREASH_MONSTER,
                fnc: () => this.refreshMonster(),
            },
            {
                name: "定时刷新BOSS",
                cron: CRON_REFREASH_BOSS,
                fnc: () => this.refreshBoss(),
            }
        ]
    }

    refreshMonster = async () => {
        RefreshMonster();
    }

    refreshBoss = async () => {
        RefreshBoss();
    }

    refreshPlayerBase = async () => {
        const players = await GetAllUid();
        players.forEach(async (player) => {
            const battleInfo = await GetBattleInfo(player);
            const levelInfo = await GetLevelInfo(player);
            if (battleInfo == undefined || levelInfo == undefined) return;

            Object.keys(battleInfo.base).forEach(attr => {
                battleInfo.base[attr] = forceNumber(data.levelList[levelInfo.level - 1][attr]) + forceNumber(data.bodyLevelList[levelInfo.bodyLevel - 1][attr]);
            });
            battleInfo.nowblood = battleInfo.base.blood;
            await SetBattleInfo(player, battleInfo);
            RefreshBattleInfo(player);
        });
    }
}

