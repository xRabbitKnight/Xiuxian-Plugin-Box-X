import plugin from '../../../../lib/plugins/plugin.js';
import { GetHelpImage, GetAdminHelpImage } from '../../model/Image/help.js';
export class BotHelp extends plugin {
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
                },
                {
                    reg: '^#修仙管理$',
                    fnc: 'Admin',
                }
            ]
        });
    }

    Help = async (e) => {
        e.reply(await GetHelpImage());
    }

    Admin = async (e) => {
        e.reply(await GetAdminHelpImage());
    }
};