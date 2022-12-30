import plugin from "../../../../lib/plugins/plugin.js";
import { RefreshBoss, RefreshMonster } from "../../model/Region/Region.js";

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
                    permission : 'master'
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
}

