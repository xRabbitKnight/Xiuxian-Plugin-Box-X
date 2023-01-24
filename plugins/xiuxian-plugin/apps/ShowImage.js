import { GetPluginHelpImage } from "../model/Image/help.js";

export default class PluginShowImage extends plugin {
    constructor() {
        super({
            name: 'PluginShowImage',
            dsc: '插件展示图片',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#修仙插件帮助$',
                    fnc: 'ShowPluginHelp'
                }
            ]
        });
    }

    ShowPluginHelp = async(e) => {
        e.reply(await GetPluginHelpImage());
    }
}