import plugin from '../../../../lib/plugins/plugin.js';
import data from '../../model/XiuxianData.js';
import config from '../../model/Config.js';
import { segment } from 'oicq';
import fs from 'node:fs';
import {Read_action,point_map, Read_level,Read_najie,Go,Add_najie_thing,Write_najie,exist_najie_thing_name,Numbers,Add_lingshi,At,Read_wealth, Write_wealth, Write_action} from '../Xiuxian/Xiuxian.js';
export class MoneyOperation extends plugin {
    constructor() {
        super({
            name: 'MoneyOperation',
            dsc: 'MoneyOperation',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#赠送灵石.*$',
                    fnc: 'Give_lingshi'
                },
                {
                    reg: '^#赠送.*$',
                    fnc: 'Give_prop' 
                },
                {
                    reg: '^#联盟报到$',
                    fnc: 'New_lingshi'
                }
            ]
        });
        this.xiuxianConfigData = config.getConfig('xiuxian', 'xiuxian');
    };
    New_lingshi=async(e)=>{
        const good=await Go(e);
        if (!good) {
            return;
        };
        const usr_qq = e.user_id;
        const action=await Read_action(usr_qq);
        const address_name='联盟';
        const map=await point_map(action,address_name);
        if(!map){
            e.reply(`需回${address_name}`);
            return;
        };
        const level=await Read_level(usr_qq);
        if(level.level_id!=1){
            return;
        };
        if(action.newnoe!=1){
            return;
        };
        action.newnoe=0;
        await Write_action(usr_qq,action);
        const equipment_name='烂铁匕首';
        const money=Number(5);
        const ifexist = JSON.parse(fs.readFileSync(`${data.__PATH.all}/all.json`)).find(item => item.name == equipment_name);
        let najie = await Read_najie(usr_qq);
        najie = await Add_najie_thing(najie, ifexist, Number(1));
        await Write_najie(usr_qq, najie);
        await Add_lingshi(usr_qq,money);
        e.reply(`[修仙联盟]方正\n看你骨骼惊奇\n就送你一把[${equipment_name}]吧\n还有这${money}灵石\n可在必要的时候用到`);
        e.reply(`你对此高兴万分\n把[${equipment_name}]放进了#储物袋`)
        return;
    };
    
    Give_lingshi = async(e) => {
        if (!await Go(e)) {
            return;
        };
        
        const giverId = e.user_id;
        const doneeId = await At(e);

        if(doneeId == 0){
            await e.reply("获赠者不存在！");
            return;
        };

        if(doneeId == giverId){
            await e.reply("请不要赠送给自己！");
            return;
        }

        let lingshi = await Numbers(e.msg.replace('#赠送灵石', ''));
        lingshi = Math.max(lingshi, 50);

        const giverWealth = await Read_wealth(giverId);
        if (giverWealth.lingshi < lingshi) {
            await e.reply([segment.at(giverId), `似乎没有${lingshi}灵石`]);
            return;
        };

        giverWealth.lingshi-=lingshi;
        await Write_wealth(giverId,giverWealth);
        await Add_lingshi(doneeId, lingshi);
        await e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${lingshi}灵石`]);

        return;
    };

    Give_prop = async(e) => {
        if (!await Go(e)) {
            return;
        };

        const giverId = e.user_id;
        const doneeId = await At(e);

        if(doneeId == 0){
            await e.reply("获赠者不存在！");
            return;
        };

        if(doneeId == giverId){
            await e.reply("请不要赠送给自己！");
            return;
        }

        let [propName, count] = await e.msg.replace('#赠送', '').replace('{at:*}','').split('*');
        count = count == undefined ? 1 : count;

        let prop = await exist_najie_thing_name(giverId, propName);
        if(prop == 1 || prop.acount < count){
            await e.reply([segment.at(giverId), `似乎没有${propName} * ${count}`]);
            return;
        }

        let giverPack = await Read_najie(giverId);
        let doneePack = await Read_najie(doneeId);

        giverPack = await Add_najie_thing(giverPack, prop, -count);
        doneePack = await Add_najie_thing(doneePack, prop, count);
        await Write_najie(giverId, giverPack);
        await Write_najie(doneeId, doneePack);

        await e.reply([segment.at(doneeId), `你获得了由${e.sender.nickname}赠送的${propName} * ${count}`]);
        return;
    }
};
