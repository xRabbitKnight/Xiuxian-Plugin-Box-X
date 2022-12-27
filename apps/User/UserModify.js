import plugin from '../../../../lib/plugins/plugin.js';
import config from '../../model/Config.js';
import { __PATH, point_map, Read_action } from '../Xiuxian/Xiuxian.js';
import { get_player_img } from '../ShowImeg/showData.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { CheckCD } from '../../model/CD/CheckCD.js';
import { AddActionCD } from '../../model/CD/AddCD.js';
import { SetAutograph, SetName } from '../../model/Cache/player/Life.js';
export class UserModify extends plugin {
    constructor() {
        super({
            name: 'UserModify',
            dsc: 'UserModify',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#改名.*$',
                    fnc: 'Rename'
                },
                {
                    reg: '^#设置道宣.*$',
                    fnc: 'ChangeAutograph'
                }
            ]
        });
        this.xiuxianConfigData = config.getConfig('xiuxian', 'xiuxian');
    };

    Rename = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        };

        if (await CheckCD(e, 'ReName')) {
            return;
        }

        const usr_qq = e.user_id;
        const action = await Read_action(usr_qq);
        const address_name = '联盟';
        const map = await point_map(action, address_name);
        if (!map) {
            e.reply(`需回${address_name}`);
            return;
        };

        let new_name = e.msg.replace('#改名', '');
        if (new_name.length == 0) {
            return;
        };
        const name = ['尼玛', '妈的', '他妈', '卧槽', '操', '操蛋', '麻痹', '傻逼', '妈逼'];
        name.forEach((item) => {
            new_name = new_name.replace(item, '');
        });
        if (new_name.length > 8) {
            e.reply('[修仙联盟]白老\n小友的这名可真是稀奇');
            return;
        };

        SetName(e.user_id, new_name);
        AddActionCD(e, 'ReName');
        return;
    };

    ChangeAutograph = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        };

        if (await CheckCD(e, 'Autograph')) {
            return;
        }

        let new_msg = e.msg.replace('#设置道宣', '');
        new_msg = new_msg.replace(' ', '');
        const name = ['尼玛', '妈的', '他妈', '卧槽', '操', '操蛋', '麻痹', '傻逼', '妈逼'];
        name.forEach((item) => {
            new_msg = new_msg.replace(item, '');
        });
        if (new_msg.length == 0 || new_msg.length > 50) {
            e.reply('请正确设置,且道宣最多50字符');
            return;
        };

        SetAutograph(e.user_id, new_msg);
        AddActionCD(e, 'Autograph');
    };

    Show_player = async (e) => {
        const img = await get_player_img(e);
        e.reply(img);
        return;
    };
};