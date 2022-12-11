import plugin from '../../../../../lib/plugins/plugin.js';
import Help from '../../../model/help.js';
import Cache from '../../../model/cache.js';
import filecp from '../../../model/filecp.js';
//配置文件------插件名/help/配置名
//(插件名,[配置名])
filecp.Pluginfile('xiuxian-association-pluging',['Association']);
export class AssociationHelp extends plugin {
    constructor() {
        super({
            name: 'AssociationHelp',
            dsc: 'AssociationHelp',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#宗门帮助$',
                    fnc: 'Pluginhelp'
                }
            ]
        });
    };
    Pluginhelp = async(e)=>{
        const data = await Help.gethelp(e, 'Association');
        if (!data) {
            return
        };
        const img = await Cache.helpcache(data, 2);
        await e.reply(img);
        return;
    }
};