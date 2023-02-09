import config from '../../../model/System/config.js';
import { AddAge, GetAllUid } from '../../../model/Cache';

export default class AgeTask extends plugin {
    constructor() {
        super({
            name: '年龄task',
            dsc: '定时增加玩家年龄',
            priority: 300,
        });

        this.task = {
            name: '定时增加玩家年龄',
            cron: config.GetConfig(['task', 'age.yaml']).cron,
            fnc: () => this.levelTask(),
        }
    }

    levelTask = async () => {
        const players = await GetAllUid();
        const ageInc = config.GetConfig(['task', 'age.yaml']).ageInc;
        players.forEach(player => AddAge(player, ageInc));
    }
}