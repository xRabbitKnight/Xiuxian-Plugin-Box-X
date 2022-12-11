import plugin from '../../../../../lib/plugins/plugin.js'
import assUtil from '../model/AssUtil.js'
import config from "../../../model/Config.js"
import fs from "node:fs"
import {
    Add_najie_thing,
    ForwardMsg,
    isNotNull,Read_action,
    Read_najie, search_thing_id, exist_najie_thing_name, Write_najie
} from "../../../apps/Xiuxian/Xiuxian.js";


/**
 * 洞天福地
 */
export class TreasureVault extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'TreasureVault',
            /** 功能描述 */
            dsc: '宗门藏宝阁模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 9999,
            rule: [
                {
                    reg: '^#(宗门藏宝阁|藏宝阁)$',
                    fnc: 'List_treasureCabinet'
                },
                {
                    reg: '^#兑换.*$',
                    fnc: 'Converted_Item'
                },
                {
                    reg: '^#藏宝阁回收.*$',
                    fnc: 'Reclaim_Item'
                },
                {
                    reg: '^#我的贡献$',
                    fnc: 'Show_Contribute'
                }
            ]
        })
        this.xiuxianConfigData = config.getConfig("xiuxian", "xiuxian");
    }


    async Reclaim_Item(e){
        const usr_qq = e.user_id;
        const ifexistplay =await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);

        if(ass.facility[1].status == 0){
            return ;
        }
        const position = JSON.parse(fs.readFileSync(`${assUtil.position}/position.json`)).find(item => item.name == ass.resident.name);
        const action = await Read_action(usr_qq);
        if(action.x < position.x1
            || action.x > position.x2
            || action.y < position.y1
            || action.y > position.y2){
            e.reply(`请先回宗门`);
            return ;
        }
        let thingName = e.msg.replace("#藏宝阁回收", '');

        const searchThing = await exist_najie_thing_name(usr_qq, thingName);
        if(searchThing == 1){
            return ;
        }
        ass.facility[1].buildNum -=1;
        await assUtil.checkFacility(ass);
        let point = Math.trunc( searchThing.price / 600);
        assPlayer.contributionPoints+=point;
        assPlayer.historyContribution+=point;
        await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
        await Add_najie_things(searchThing,usr_qq,-1);
        e.reply(`回收成功，你获得了${point}点贡献点！`);


        const id = searchThing.id.split('-');
        if (id[0] > 5 || id[2] > 19) {
            return;
        }
        const assTreasureCabinet = assUtil.getAssOrPlayer(4,assPlayer.assName);
        const length = Math.ceil(ass.level / 3);
        let isExist = false;
        for(let i=0; i < length; i++){
            const location = assTreasureCabinet[i].findIndex(item => item.id == searchThing.id);
            if(location != -1){
                isExist = true;
            }
        }

        if(!isExist){
            let location =0;
            if(point < 10){
                location =0;
            }else if(point < 100){
                location = 1;
            }else {
                location =2;
            }
            let addTing ={
                "id": searchThing.id,
                "name": searchThing.name,
                "privileges": location*2+1,
                "redeemPoint": Math.ceil(searchThing.price / 500)
            }
            assTreasureCabinet[location].push(addTing);
            await assUtil.setAssOrPlayer("assTreasureVault",assPlayer.assName,assTreasureCabinet);
        }
        return ;

    }




    //藏宝阁
    async List_treasureCabinet(e) {
        const usr_qq = e.user_id;
        const ifexistplay =await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }

        let msg = [
            "___[宗门藏宝阁]___"
        ];
        let basetreasureCabinet = assUtil.baseTreasureVaultList;
        let assTreasureCabinet = assUtil.getAssOrPlayer(4,assPlayer.assName);
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);

        const length = Math.ceil(ass.level / 3);
        for (let i = 0; i < length; i++) {
            assTreasureCabinet[i].push(...basetreasureCabinet[i]);
            msg.push(`第${i+1}层`);
            for(let j = 0; j < assTreasureCabinet[i].length; j++){
                msg.push(
                    "物品：" + `${assTreasureCabinet[i][j].name}` +
                    "\n所需贡献值：" + `${assTreasureCabinet[i][j].redeemPoint}` +
                    "\n所需权限：" + `${assTreasureCabinet[i][j].privileges}`);
            }
        }

        await ForwardMsg(e, msg)
        return;
    }


    //兑换
    async Converted_Item(e) {
        const usr_qq = e.user_id;
        const ifexistplay =await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }

        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        const thingName = e.msg.replace("#兑换", '');

        if(ass.facility[1].status == 0 || thingName == ""){
            return ;
        }
        const position = JSON.parse(fs.readFileSync(`${assUtil.position}/position.json`)).find(item => item.name == ass.resident.name);
        const action = await Read_action(usr_qq);
        if(action.x < position.x1
            || action.x > position.x2
            || action.y < position.y1
            || action.y > position.y2){
            e.reply(`请先回宗门`);
            return ;
        }

        let basetreasureCabinet = assUtil.baseTreasureVaultList;
        let assTreasureCabinet = assUtil.getAssOrPlayer(4,assPlayer.assName);

        let length = Math.ceil(ass.level / 3);
        let exchangeThing ;
        for (let i = 0; i < length; i++) {
            assTreasureCabinet[i].push(...basetreasureCabinet[i]);
            if(isNotNull(assTreasureCabinet[i].find(item => item.name == thingName))){
                exchangeThing =assTreasureCabinet[i].find(item => item.name == thingName);
            }
        }

        if(!isNotNull(exchangeThing)){
            return ;
        }

        if(assPlayer.contributionPoints < exchangeThing.redeemPoint || assPlayer.assJob < exchangeThing.privileges){
            e.reply(`贡献或权限不足！`);
            return ;
        }

        ass.facility[1].buildNum -=1;
        await assUtil.checkFacility(ass);
        assPlayer.contributionPoints -= exchangeThing.redeemPoint;
        assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
        const addThing =await search_thing_id(exchangeThing.id);
        await Add_najie_things(addThing, usr_qq, 1);
        e.reply(`兑换成功！！！`)
        return;
    }

    async Show_Contribute(e) {
        const usr_qq = e.user_id;
        const ifexistplay =await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }
        e.reply(`你当前还剩${assPlayer.contributionPoints}贡献点，历史贡献值总和为${assPlayer.historyContribution}`);
        return ;

    }

}


async function Add_najie_things(thing ,user_qq, account) {
    let najie = await Read_najie(user_qq);
    najie = await Add_najie_thing(najie,thing,account);
    await Write_najie(user_qq,najie);
    return ;
}










