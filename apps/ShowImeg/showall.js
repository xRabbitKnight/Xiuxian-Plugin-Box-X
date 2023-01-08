import plugin from '../../../../lib/plugins/plugin.js';
import { GetMap } from '../../model/Image/map.js';
import { GetLevelImage, GetLevelmaxImage } from '../../model/Image/state.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
export default class showall extends plugin {
    constructor() {
        super({
            name: 'showall',
            dsc: 'showall',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#练气境界$',
                    fnc: 'Level',
                },
                {
                    reg: '^#炼体境界$',
                    fnc: 'LevelMax',
                },
                {
                    reg: '^#修仙地图$',
                    fnc: 'Map',
                },
                {
                    reg: '^#修仙版本$',
                    fnc: 'show_updata',
                }
            ]
        });
    }

    Level = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }
        e.reply(await GetLevelImage(e.user_id));
    }

    LevelMax = async (e) => {
        if (!await CheckStatu(e, StatuLevel.exist)) {
            return;
        }
        e.reply(await GetLevelmaxImage(e.user_id));
    }

    Map = async (e) => {
        e.reply(await GetMap());
    }
};