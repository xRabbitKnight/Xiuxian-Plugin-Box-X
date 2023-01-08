import plugin from '../../../../../lib/plugins/plugin.js'
import assUtil from '../model/AssUtil.js'
import { exist_najie_thing_id, ForwardMsg, Read_najie, Write_najie,Add_najie_thing,existplayerplugins,Write_action} from "../../../apps/Xiuxian/Xiuxian.js";
import fs from "node:fs"

/**
 * 宗门
 */

export class AssociationExtend extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'AssociationExtend',
            /** 功能描述 */
            dsc: '宗门模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: '^#鉴定宗门令牌$',
                    fnc: 'identify_token'
                },
                {
                    reg: '^#加载宗门玩法$',
                    fnc: 'load_association'
                },
                {
                    reg: "^#宗门玩法存档$",
                    fnc: "showAssPlayer",
                },
                {
                    reg: "^#宗门存档刷新$",
                    fnc: "refreshAssPlayer",
                }
            ]
        })
    }

    async refreshAssPlayer(e){
        if (!e.isMaster) {
            return;
        }
        e.reply("开始同步");

        let playerList = [];
        let files = fs
            .readdirSync("./plugins/Xiuxian-Plugin-Box/resources/data/birth/xiuxian/najie")
            .filter((file) => file.endsWith(".json"));
        for (let file of files) {
            file = file.replace(".json", "");
            playerList.push(file);
        }
        for (let player_id of playerList) {
            let count = [];
            let najie= await Read_najie(player_id);
            for (let i=0;i<najie.thing.length;i++){
                const ifexist0 = JSON.parse(fs.readFileSync(`${assUtil.all}/all.json`)).find(item => item.id == najie.thing[i].id);
                if(!ifexist0){
                    count.push(i);
                }else {
                    ifexist0.account = najie.thing[i].account;
                    najie.thing[i]=ifexist0;
                }
            }
            for (let i=count.length-1;i>=0;i--){
                najie.thing.splice(count[i],1);
            }
           await Write_najie(player_id,najie);
        }
        e.reply("同步结束");
        return;
    }


    async showAssPlayer(e){
        const usr_qq = e.user_id;
        //无存档
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }
        const assRelation = assUtil.assRelationList.find(item => item.id ==  assPlayer.assName);
        let msg = [
            `__[${usr_qq}的宗门存档]__`
        ];
        msg.push("QQ：" + usr_qq + "\n"
            + "所属宗门：" + assRelation.name +"\n"
            + "权限等级：" + assPlayer.assJob + "\n"
            +"修炼效率加成：" + assPlayer.effective + "\n"
            +"神兽好感度：" + assPlayer.favorability + "\n"
            +"当前贡献值：" + assPlayer.contributionPoints + "\n"
            +"历史贡献值：" + assPlayer.historyContribution);
        await ForwardMsg(e, msg);
        return ;
    }


    async identify_token(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const isExists =await exist_najie_thing_id(usr_qq,"6-2-40");
        if(isExists == 1){
            e.reply(`没令牌你鉴定个锤子`);
            return ;
        }
        const random =Math.random();
        let najie =await Read_najie(usr_qq);
        najie = await Add_najie_thing(najie, isExists, -1);
        let newToken;
        if(random < 0.1){
            newToken = {
                "id": "6-2-43",
                "name": "上等宗门令牌",
                "attack": 1,
                "defense": 1,
                "blood": 1,
                "burst": 1,
                "burstmax": 1,
                "size": 1,
                "experience": 1,
                "experiencemax": 1,
                "speed": 1,
                "acount": 1,
                "price": 10000
            };
            e.reply(`你获得了上等宗门令牌`);
            najie =  await Add_najie_thing(najie, newToken, 1);
        }else if(random < 0.35){
            newToken = {
                "id": "6-2-42",
                "name": "中等宗门令牌",
                "attack": 1,
                "defense": 1,
                "blood": 1,
                "burst": 1,
                "burstmax": 1,
                "size": 1,
                "experience": 1,
                "experiencemax": 1,
                "speed": 1,
                "acount": 1,
                "price": 3000
            };
            e.reply(`你获得了中等宗门令牌`);
            najie =  await Add_najie_thing(najie, newToken, 1);
        }else {
            newToken = {
                "id": "6-2-41",
                "name": "下等宗门令牌",
                "attack": 1,
                "defense": 1,
                "blood": 1,
                "burst": 1,
                "burstmax": 1,
                "size": 1,
                "experience": 1,
                "experiencemax": 1,
                "speed": 1,
                "acount": 1,
                "price": 1500
            };
            e.reply(`你获得了下等宗门令牌`);
            najie = await Add_najie_thing(najie, newToken, 1);
        }
        await Write_najie(usr_qq,najie);
        return ;
    }


    async load_association(e){
        const usr_qq = e.user_id;
        const ifexistplay = await existplayerplugins(usr_qq);
        if (!ifexistplay || !e.isGroup || assUtil.existAss("assPlayer",usr_qq)) {
            return;
        }
        let assPlayer={
                "assName": 0,
                "qqNumber": usr_qq+"",
                "assJob": 0,
                "effective": 0,
                "contributionPoints": 0,
                "historyContribution": 0,
                "favorability": 0,
                "volunteerAss": 0,
                "lastSignAss":0,
                "lastExplorTime":0,
                "lastBounsTime":0,
                "xiuxianTime":ifexistplay.createTime,
                "time": []
            };
        await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
        e.reply(`宗门系统存档创建成功！`);
        return ;
        }



    async show_uncharted_detail(e){

        const usr_qq = e.user_id;
        const ifexistplay =await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup || !assUtil.existAss("assPlayer",usr_qq)) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        if(ass.facility[2].status == 0){
            e.reply(`宗门秘境维护中，无法查看`);
            return ;
        }

        let level = Math.ceil(ass.level / 3) - 1;

        let baseUncharted = assUtil.baseUnchartedList[level];
        let assUncharted = assUtil.getAssOrPlayer(3,ass.id);
        let assRelation = assUtil.assRelationList.find(item => item.id == ass.id);
        let uncharted = [ assUncharted.one,assUncharted.two,assUncharted.three ];

        let msg = [
           `__[${assRelation.unchartedName}]__`
        ];
        for (let i = 0; i < 3; i++) {
            uncharted[i].push(...baseUncharted.one);
            msg.push(`第${i+1}层`);
            for(let j = 0; j < uncharted[i].length; j++){
                msg.push(
                    `物品：${uncharted[i][j].name} `+
                    "\n价值：" +`${uncharted[i][j].price}` );
            }
        }

        await ForwardMsg(e, msg);

    }

}
