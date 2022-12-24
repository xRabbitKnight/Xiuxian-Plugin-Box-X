import plugin from '../../../../lib/plugins/plugin.js';
import config from '../../model/Config.js';
import { getWarehouseImg, get_najie_img } from '../ShowImeg/showData.js';
import { segment } from 'oicq';
import { existplayer, Read_najie, point_map,Read_action,Add_lingshi, Write_najie, Numbers, Add_najie_lingshi, Read_wealth, exist_najie_thing_name, Add_najie_thing, readWarehouse, modifyWarehouseItem, writeWarehouse, findWarehouseItemByName } from '../Xiuxian/Xiuxian.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
export class UserAction extends plugin {
    constructor() {
        super({
            name: 'UserAction',
            dsc: 'UserAction',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#储物袋$',
                    fnc: 'Show_najie'
                },
                {
                    reg: '^#升级储物袋$',
                    fnc: 'Lv_up_najie'
                },
                {
                    reg: '^#(存|取)灵石(.*)$',
                    fnc: 'Take_lingshi'
                },
                {
                    reg: '^#仓库$',
                    fnc: 'showWarehouse'
                },
                {
                    reg: '^#(存|取)(.*)$',
                    fnc: 'accessWarehouse'
                },
            ]
        });
        this.xiuxianConfigData = config.getConfig('xiuxian', 'xiuxian');
    };


    /**
     * 此功能需要去   #炼器师协会
     */

    Show_najie = async (e) => {
        const usr_qq = e.user_id;
        const ifexistplay = await existplayer(usr_qq);
        if (!ifexistplay) {
            return;
        };
        const img = await get_najie_img(e);
        e.reply(img);
        return;
    };
    Lv_up_najie = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canLevelUp)) {
            return;
        };
        const usr_qq = e.user_id;
        const action=await Read_action(usr_qq);
        const address_name='炼器师协会';
        const map=await point_map(action,address_name);
        if(!map){
            e.reply(`需回${address_name}`);
            return;
        };
        const najie = await Read_najie(usr_qq);
        const player = await Read_wealth(usr_qq);
        const najie_num = this.xiuxianConfigData.najie_num
        const najie_price = this.xiuxianConfigData.najie_price
        if (najie.grade == najie_num.length) {
            e.reply('已经是最高级的了');
            return;
        };
        if (player.lingshi < najie_price[najie.grade]) {
            e.reply(`灵石不足,还需要准备${najie_price[najie.grade] - player.lingshi}灵石`);
            return;
        };
        await Add_lingshi(usr_qq, -najie_price[najie.grade]);
        najie.lingshimax = najie_num[najie.grade];
        najie.grade += 1;
        await Write_najie(usr_qq, najie);
        e.reply(`花了${najie_price[najie.grade - 1]}灵石升级,目前灵石存储上限为${najie.lingshimax}`)
        return;
    };
    Take_lingshi = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        };
        const usr_qq = e.user_id;
        const reg = new RegExp(/取|存/);
        const func = reg.exec(e.msg);
        const msg = e.msg.replace(reg, '');
        let lingshi = msg.replace('#灵石', '');
        const player_lingshi = await Read_wealth(usr_qq);
        if (lingshi == '全部') {
            lingshi = player_lingshi.lingshi;
        };
        lingshi = await Numbers(lingshi);
        if (func == '存') {
            if (player_lingshi.lingshi < lingshi) {
                e.reply([segment.at(usr_qq), `灵石不足,目前只有${player_lingshi.lingshi}灵石`]);
                return;
            };
            const najie = await Read_najie(usr_qq);
            if (najie.lingshimax < najie.lingshi + lingshi) {
                await Add_najie_lingshi(usr_qq, najie.lingshimax - najie.lingshi);
                await Add_lingshi(usr_qq, -najie.lingshimax + najie.lingshi);
                e.reply([segment.at(usr_qq), `已放入${najie.lingshimax - najie.lingshi}灵石,储物袋存满了`]);
                return;
            };
            await Add_najie_lingshi(usr_qq, lingshi);
            await Add_lingshi(usr_qq, -lingshi);
            e.reply([segment.at(usr_qq), `储存完毕,目前还有${player_lingshi.lingshi - lingshi}灵石,储物袋内有${najie.lingshi + lingshi}灵石`]);
            return;
        }
        if (func == '取') {
            const najie = await Read_najie(usr_qq);
            if (najie.lingshi < lingshi) {
                e.reply([segment.at(usr_qq), `储物袋灵石不足,目前最多取出${najie.lingshi}灵石`]);
                return;
            };
            await Add_najie_lingshi(usr_qq, -lingshi);
            await Add_lingshi(usr_qq, lingshi);
            e.reply([segment.at(usr_qq), `本次取出灵石${lingshi},储物袋还剩余${najie.lingshi - lingshi}灵石`]);
            return;
        };
        return;
    };

    /**
     * 仓库查看及存取相关功能
     */
    warehousePre = async (e) => {
        const usr_qq = e.user_id;
        if (!await CheckStatu(e, StatuLevel.canLevelUp)) {
            return false;
        };
        const action = await Read_action(usr_qq);
        const address_name = '万宝楼';
        const map = await point_map(action, address_name);
        if(!map){
            e.reply(`需回${address_name}`);     // 玩家位于「万宝楼」
            return false;
        };
        return true;
    };

    showWarehouse = async (e) => {
        let pre = await this.warehousePre(e);
        if(!pre) return;
        const img = await getWarehouseImg(e);
        e.reply(img)
    }

    accessWarehouse = async (e) => {
        let pre = await this.warehousePre(e);
        if(!pre) return;
        
        const usr_qq = e.user_id;
        const op = e.msg.substr(1, 1);
        let [itmeName, itemNum] = e.msg.substr(2).split('*');
        itemNum = await Numbers(itemNum);
        if(op == '存') {
            var item = await exist_najie_thing_name(usr_qq, itmeName);
        } else if(op == '取') {
            var item = await findWarehouseItemByName(usr_qq, itmeName);
            itemNum *= -1;
        }
        if (item == 1 || item == undefined) {
            e.reply(`没有[${itmeName}]`);
            return;
        };
        if (item.acount < Math.abs(itemNum)) {
            e.reply(`[${itmeName}]不够`);
            return;
        };
        let backpack = await Read_najie(usr_qq);
        backpack = await Add_najie_thing(backpack, item, -itemNum);
        await Write_najie(usr_qq, backpack);
        let warehouse = await readWarehouse(usr_qq);
        warehouse = await modifyWarehouseItem(warehouse, item, itemNum);
        await writeWarehouse(usr_qq, warehouse);
        e.reply('操作成功！')
    }
};