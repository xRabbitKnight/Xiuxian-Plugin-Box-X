import plugin from '../../../../lib/plugins/plugin.js';
import { GetHelpImage } from '../../model/Image/help.js';
export default class BotHelp extends plugin {
    constructor() {
        super({
            name: 'BotHelp',
            dsc: 'BotHelp',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#修仙帮助$',
                    fnc: 'Help'
                }
            ]
        });
    }

    Help = async (e) => {
        e.reply(await GetHelpImage());
    }
};