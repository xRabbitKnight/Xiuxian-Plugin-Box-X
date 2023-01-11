import plugin from '../../../../lib/plugins/plugin.js';
import { GetEquipmentImage, GetManualImage, GetPlayerInfoImage } from '../../model/Image/player.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
export default class UserInformation extends plugin {
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
                    reg: '^#装备信息$',
                    fnc: 'EquipmentInfo',
                },
                {
                    reg: '^#功法信息$',
                    fnc: 'ManualInfo',
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

    EquipmentInfo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }
        e.reply(await GetEquipmentImage(e.user_id));
    }

    ManualInfo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }
        e.reply(await GetManualImage(e.user_id));
    }
}