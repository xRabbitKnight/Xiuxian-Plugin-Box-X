import plugin from '../../../../lib/plugins/plugin.js';
import config from '../../model/Config.js';
import { AddAge } from '../../model/Cache/player/Life.js';
import { GetAllUid } from '../../model/Cache/player/players.js';
import { __PATH } from '../Xiuxian/Xiuxian.js';

export class UserTask extends plugin {
    constructor() {
        super({
            name: 'LifeTask',
            dsc: 'LifeTask',
            event: 'message',
            priority: 300
        });

        this.ageInc = config.getConfig('xiuxian', 'xiuxian').Age.size;
        this.set = config.getConfig('task', 'task');
        this.task = {
            name: 'LifeTask',
            cron: this.set.LifeTask,
            fnc: () => this.levelTask(),
        }
    }

    levelTask = async () => {
        const players = await GetAllUid();
        players.forEach(player => AddAge(player, this.ageInc));
    }
};