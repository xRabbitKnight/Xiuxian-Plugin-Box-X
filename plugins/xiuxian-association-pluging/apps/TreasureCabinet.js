import plugin from '../../../../../lib/plugins/plugin.js'
import data from '../../../model/XiuxianData.js'
import assUtil from '../model/AssUtil.js'
import config from "../../../model/Config.js"
import {
    Add_najie_thing,
    shijianc,
    AddBloodToPercent, Add_experience, Add_experiencemax,Read_action,
    Read_najie, Write_najie, Read_level, search_thing_name, exist_najie_thing_id
} from "../../../apps/Xiuxian/Xiuxian.js";
import fs from "node:fs"


/**
 * 洞天福地
 */
const BeastList = ["麒麟","青龙","白虎","朱雀","玄武"];

export class TreasureCabinet extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'TreasureCabinet',
            /** 功能描述 */
            dsc: '宗门神兽模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 9999,
            rule: [
                {
                    reg: '^#召唤神兽$',
                    fnc: 'Summon_Divine_Beast'
                },
                {
                    reg: '^#喂给神兽.*$',
                    fnc: 'Feed_Beast'
                },
                {
                    reg: '^#神兽赐福$',
                    fnc: 'Beast_Bonus'
                }
            ]
        })
        this.xiuxianConfigData = config.getConfig("xiuxian", "xiuxian");
    }

    async Summon_Divine_Beast(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){

            return;
        }

        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);

        if(ass.resident.name==0
            || ass.facility[3].status==0
            || assPlayer.assJob <10
            || ass.level <6
            || ass.spiritStoneAns<1000000
            || ass.divineBeast!=0){
            e.reply(`你的宗门不满足召唤神兽的条件！！！`);
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

        //校验都通过了，可以召唤神兽了
        let random=Math.random()*5;
        ass.divineBeast=Math.ceil(random);

        ass.spiritStoneAns-=1000000;
        await assUtil.setAssOrPlayer("association",ass.id,ass);
        e.reply(`召唤成功，神兽${BeastList[ass.divineBeast - 1]}投下一道分身，开始守护你的宗门`);
        return ;
    }

    async Beast_Bonus(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.contributionPoints <= 1){
            return;
        }

        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);

        if(ass.divineBeast==0 || ass.facility[3].status==0){
            return;
        }

        const now = new Date();
        const nowTime = now.getTime(); //获取当前日期的时间戳
        const Today = await shijianc(nowTime);
        const lastBounsTime = await shijianc(assPlayer.lastBounsTime);//获得上次宗门签到日期
        if (Today.Y == lastBounsTime.Y && Today.M == lastBounsTime.M && Today.D == lastBounsTime.D) {
            e.reply(`今日已经接受过神兽赐福了，明天再来吧`);
            return;
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
        const random = Math.random();
        let flag=0.5;
        let ans = 0.3;
        //根据好感度获取概率
        if(assPlayer.favorability > 1000){
            ans = 0 ;
            flag=0.1;
        }else if(assPlayer.favorability > 500){
            ans = 0.1 ;
            flag=0.25;
        }else if(assPlayer.favorability > 200){
            ans = 0.2 ;
            flag=0.35;
        }
        if(random > flag){
            let randomA=Math.random();
            let res = 1 ;
            if(randomA > (0.5+ans)){
                res = 1;
                ass.facility[3].buildNum -=3;
            }else if(randomA > (0.2+ans)){
                res = 2;
                ass.facility[3].buildNum -=2;
            }else {
                res = 3 ;
                ass.facility[3].buildNum -=1;
            }
            assPlayer.lastBounsTime = nowTime;
            assPlayer.contributionPoints -=1;
            await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
            await assUtil.checkFacility(ass);

            let location = 0 ;
            let item = {};
            const playerLevel = await Read_level(usr_qq);
            const now_level_id = playerLevel.level_id;
            const body_level_id = playerLevel.levelmax_id;
            //获得奖励
            let randomB = Math.random();
            let timeList = [];
            if(ass.divineBeast==1){
                let danyao_list =JSON.parse(fs.readFileSync(`${data.fixedequipment}/danyao_list.json`));
                if(flag == 0.1 && res == 1 && randomB > 0.8){
                    location = Math.floor(Math.random()*5);
                    timeList = danyao_list.slice(15,19);
                    item = timeList[location];
                }else {
                    location = Math.floor(Math.random() * ((danyao_list.length - 5) / res));
                    item = danyao_list[location];
                }
                await Add_experiencemax(usr_qq , 50*body_level_id );
                await Add_experience(usr_qq , 50*now_level_id);
                await Add_najie_things(item,usr_qq,1);
            }else if(ass.divineBeast==2){
                let gongfa_list =JSON.parse(fs.readFileSync(`${data.fixedequipment}/gongfa_list.json`));
                if(flag == 0.1 && res == 1 && randomB > 0.8){
                    location = Math.floor(Math.random()*5);
                    timeList = gongfa_list.slice(15,19);
                    item = timeList[location];
                }else {
                    location = Math.floor(Math.random() * ((gongfa_list.length - 5) / res));
                    item = gongfa_list[location];
                }
                await Add_experience(usr_qq , 30*now_level_id);
                await Add_najie_things(item,usr_qq,1);
            }else if(ass.divineBeast==5){
                let huju_list =JSON.parse(fs.readFileSync(`${data.fixedequipment}/huju_list.json`));
                if(flag == 0.1 && res == 1 && randomB > 0.8){
                    location = Math.floor(Math.random()*5);
                    timeList = huju_list.slice(15,19);
                    item = timeList[location];
                }else {
                    location = Math.floor(Math.random() * ((huju_list.length -5) / res));
                    item =huju_list[location];
                }
                await Add_experiencemax(usr_qq , 30*body_level_id );
                await Add_najie_things(item,usr_qq,1);

            }else if(ass.divineBeast==4){
                let fabao_list =JSON.parse(fs.readFileSync(`${data.fixedequipment}/fabao_list.json`));
                if(flag == 0.1 && res == 1 && randomB > 0.8){
                    location = Math.floor(Math.random()*5);
                    timeList = fabao_list.slice(15,19);
                    item = timeList[location];
                }else {
                    location = Math.floor(Math.random() * ((fabao_list.length - 5) / res));
                    item = fabao_list[location];
                }
                await Add_experience(usr_qq , 30*now_level_id);
                await Add_najie_things(item,usr_qq,1);
            }else {
                let wuqi_list =JSON.parse(fs.readFileSync(`${data.fixedequipment}/wuqi_list.json`));
                if(flag == 0.1 && res == 1 && randomB > 0.8){
                    location = Math.floor(Math.random()*5);
                    timeList = wuqi_list.slice(15,19);
                    item = timeList[location];
                }else {
                    location = Math.floor(Math.random() * ((wuqi_list.length - 5) / res));
                    item = wuqi_list[location];
                }
                await Add_experiencemax(usr_qq , 30*body_level_id );
                await Add_najie_things(item,usr_qq,1);
            }
            await AddBloodToPercent(usr_qq , 100)
            if(flag == 0.1 && res == 1 && randomB > 0.8){
                e.reply(`看见你来了,${BeastList[ass.divineBeast - 1]}很高兴，仔细挑选了${item.name}给你`);

            }else {
                e.reply(`${BeastList[ass.divineBeast - 1]}今天心情不错，随手丢给了你${item.name}`);
            }
            e.reply(`经过神兽的赐福，你的血量回满了，同时修为或气血得到了一定的提升`);
            return ;
        }else {
            e.reply(`${BeastList[ass.divineBeast - 1]}闭上了眼睛，表示今天不想理你`);
            return ;
        }

    }


    async Feed_Beast(e){
        const usr_qq = e.user_id;
        //用户不存在
        const ifexistplay =await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        if(ass.divineBeast==0){
            return;
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

        let  thing_name = e.msg.replace("#喂给神兽", '');
        thing_name = thing_name.trim();

        const searchThing = await search_thing_name(thing_name);

        if (searchThing == 1) {
            e.reply(`不存在这样的东西:${thing_name}`);
            return;
        }

        const thing_quantity = await exist_najie_thing_id(usr_qq, searchThing.id);

        if (thing_quantity == 1) {
            e.reply(`你没有【${thing_name}】这样的东西!`);
            return;
        }

        const CDTime = 120;
        const ClassCD = ":feedBonusTime";
        const now_time = new Date().getTime();
        const cdSecond =await redis.ttl("xiuxian:player:" + usr_qq + ClassCD);
        if(cdSecond!= -2){
            if(cdSecond == -1){
                e.reply(`喂养神兽cd状态残留，请联系机器人管理员处理！`);
                return ;
            }
            e.reply(`喂养cd中，剩余${cdSecond}秒！`);
            return ;
        }

        await redis.set("xiuxian:player:" + usr_qq + ClassCD ,now_time);
        await redis.expire("xiuxian:player:" + usr_qq + ClassCD , CDTime * 60);

        //纳戒数量减少
        await Add_najie_things(searchThing, usr_qq,-1);

        assPlayer.favorability+=Math.trunc(searchThing.price/1000);

        assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
        e.reply(`喂养成功，你和神兽的亲密度增加了${Math.trunc(searchThing.price/1000)},当前为${assPlayer.favorability}`);
        return ;
        }


}


async function Add_najie_things(thing ,user_qq, account) {
    let najie = await Read_najie(user_qq);
    najie = await Add_najie_thing(najie,thing,account);
    await Write_najie(user_qq,najie);
    return ;
}

