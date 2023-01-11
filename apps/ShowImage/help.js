import * as _ from '../../model/Image/help.js';

export default class helpImage extends plugin {
    constructor() {
        super({
            name: 'helpImage',
            dsc: '展示帮助图片',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#修仙帮助$',
                    fnc: 'Help'
                },
                {
                    reg: '^#修仙地图$',
                    fnc: 'Map',
                }
            ]
        });
    }

    Help = async (e) => {
        e.reply(await _.GetHelpImage());
    }

    Map = async (e) => {
        e.reply(await _.GetMap());
    }
}