import plugin from '../../../../lib/plugins/plugin.js';
import config from '../../model/Config.js';
import { __PATH, Write_player, point_map,Read_action, Read_player, Read_wealth, Write_Life, Read_Life, Add_lingshi } from '../Xiuxian/Xiuxian.js';
import { get_player_img } from '../ShowImeg/showData.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { CheckCD } from '../../model/CD/CheckCD.js';
import { AddActionCD } from '../../model/CD/AddCD.js';
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
                    fnc: 'Change_name'
                },
                {
                    reg: '^#设置道宣.*$',
                    fnc: 'Change_autograph'
                }
            ]
        });
        this.xiuxianConfigData = config.getConfig('xiuxian', 'xiuxian');
    };
    Change_name = async (e) => {
        if (!CheckStatu(e, StatuLevel.inAction)) {
            return;
        };

        if(CheckCD(e, 'ReName')){
            return ;
        }
        const usr_qq = e.user_id;
        const action =await Read_action(usr_qq);
        const address_name='联盟';
        const map=await point_map(action,address_name);
        if(!map){
            e.reply(`需回${address_name}`);
            return;
        };
        const lingshi = 5;
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
        const wealth = await Read_wealth(usr_qq);
        if (wealth.lingshi < lingshi) {
            e.reply(`需${lingshi}灵石`);
            return;
        };

        await Add_lingshi(usr_qq, -lingshi);
        const life = await Read_Life();
        life.forEach((item) => {
            if (item.qq == usr_qq) {
                item.name = new_name;
            };
        });
        await Write_Life(life);
        this.Show_player(e);
        await AddActionCD(e, 'ReName');
        return;
    };
    Change_autograph = async (e) => {
        if (!CheckStatu(e, StatuLevel.inAction)) {
            return;
        };

        if(CheckCD(e, 'Autograph')){
            return ;
        }
        const usr_qq = e.user_id;
        const player = await Read_player(usr_qq);
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
        player.autograph = new_msg;
        await Write_player(usr_qq, player);
        this.Show_player(e);
        await AddActionCD(e, 'Autograph');
        return;
    };
    Show_player = async (e) => {
        const img = await get_player_img(e);
        e.reply(img);
        return;
    };
};