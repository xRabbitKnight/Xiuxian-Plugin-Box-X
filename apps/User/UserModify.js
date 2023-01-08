import plugin from '../../../../lib/plugins/plugin.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { CheckCD } from '../../model/CD/CheckCD.js';
import { AddActionCD } from '../../model/CD/AddCD.js';
import { SetAutograph, SetName } from '../../model/Cache/player/Life.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
export default class UserModify extends plugin {
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
    }

    Rename = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (await CheckCD(e, 'reName')) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '联盟')) {
            e.reply(`需回联盟`);
            return;
        }

        let new_name = e.msg.replace('#改名', '');
        if (new_name.length == 0) {
            return;
        }
        const name = ['尼玛', '妈的', '他妈', '卧槽', '操', '操蛋', '麻痹', '傻逼', '妈逼'];
        name.forEach(item => new_name = new_name.replace(item, ''));
        if (new_name.length > 8) {
            e.reply('[修仙联盟]白老\n小友的这名可真是稀奇');
            return;
        }

        SetName(e.user_id, new_name);
        AddActionCD(e, 'reName');
    }

    ChangeAutograph = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (await CheckCD(e, 'autograph')) {
            return;
        }

        let new_msg = e.msg.replace('#设置道宣', '');
        new_msg = new_msg.replace(' ', '');
        const name = ['尼玛', '妈的', '他妈', '卧槽', '操', '操蛋', '麻痹', '傻逼', '妈逼'];
        name.forEach(item => new_msg = new_msg.replace(item, ''));
        if (new_msg.length == 0 || new_msg.length > 50) {
            e.reply('请正确设置,且道宣最多50字符');
            return;
        }

        SetAutograph(e.user_id, new_msg);
        AddActionCD(e, 'autograph');
    }
}