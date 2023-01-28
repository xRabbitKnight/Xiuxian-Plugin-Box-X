import { getHelpImage } from "../model/Image/Help.js";

export default class Help extends plugin {
    constructor() {
        super({
            name: 'EasyCommandHelpImage',
            dsc: '快捷指令帮助图片',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#快捷帮助$',
                    fnc: 'showHelpImage'
                }
            ]
        });
    }

    showHelpImage = async(e) => {
        e.reply(await getHelpImage());
    }
}