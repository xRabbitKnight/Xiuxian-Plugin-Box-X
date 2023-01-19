import config from "../../../model/System/config.js";
import { RefreshBoss, RefreshMonster } from "../../../model/Region/Region.js";

export default class RefreshTask extends plugin {
    constructor() {
        super({
            name: "刷新怪物task",
            dsc: "定时刷新怪物",
            priority: 300,
        });
        
        this.task = [
            {
                name: "定时刷新怪物",
                cron: config.GetConfig('task/monster.yaml').monster.cron,
                fnc: () => this.refreshMonster(),
            },
            {
                name: "定时刷新BOSS",
                cron: config.GetConfig('task/monster.yaml').boss.cron,
                fnc: () => this.refreshBoss(),
            }
        ];
    }

    refreshMonster = async () => {
        RefreshMonster();
    }

    refreshBoss = async () => {
        RefreshBoss();
    }
}