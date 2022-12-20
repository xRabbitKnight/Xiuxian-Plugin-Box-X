import plugin from "../../../../lib/plugins/plugin.js";
import { RefreshMonster } from "../../model/Region/Region.js";

//TODO: 这玩意应该扔到配置里
const CRON_REFREASH = '0 0 0/1 * * ?'

export class MonsterRefresh extends plugin {
    constructor() {
        super({
            name: "刷新怪物",
            dsc: "定时刷新每个区域的怪物",
            event: 'message',
            priority: 300,
        });
        this.task = {
            name: "定时刷新怪物",
            cron: CRON_REFREASH,
            fnc : () => this.refreshTask()
        }
    };

    refreshTask = async() =>{
        Bot.logger.info("怪物已刷新！");
        RefreshMonster();
    }
}

