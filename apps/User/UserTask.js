import config from '../../model/System/config.js';
import { AddAge } from '../../model/Cache/player/Life.js';
import { GetAllUid } from '../../model/Cache/player/players.js';

export default class UserTask extends plugin {
    constructor() {
        super({
            name: 'LifeTask',
            dsc: 'LifeTask',
            event: 'message',
            priority: 300,
        });

        this.task = {
            name: 'LifeTask',
            cron: config.GetConfig('task/age.yaml').cron,
            fnc: () => this.levelTask(),
        }
    }

    levelTask = async () => {
        const players = await GetAllUid();
        players.forEach(player => AddAge(player, config.GetConfig('task/age.yaml').ageInc));
    }
}