import plugin from '../../../../lib/plugins/plugin.js';
import { GetEquipmentImage, GetPlayerInfoImage } from '../../model/Image/player.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
export class UserInformation extends plugin {
    constructor() {
        super({
            name: 'UserInformation',
            dsc: 'UserInformation',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#基础信息$',
                    fnc: 'PlayerInfo'
                },
                {
                    reg: '^#面板信息$',
                    fnc: 'PropertyPanel',
                },
                {
                    reg: '^#功法信息$',
                    fnc: 'show_gongfa',
                }
            ]
        });
    }

    PlayerInfo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }
        e.reply(await GetPlayerInfoImage(e.user_id));
    }

    PropertyPanel = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }
        e.reply(await GetEquipmentImage(e.user_id));
    }
};