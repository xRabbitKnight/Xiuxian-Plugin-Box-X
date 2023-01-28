import { getHelpImage } from "../model/Image/HelpImg";

export default class Help extends plugin {
    constructor() {
        super({
            name: 'PluginShowImage',
            dsc: '插件展示图片',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#修仙插件帮助$',
                    fnc: 'showHelpImage'
                }
            ]
        });
    }

    showHelpImage = async(e) => {
        e.reply(await getHelpImage());
    }
}