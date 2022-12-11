import plugin from '../../../../../lib/plugins/plugin.js'
import data from '../../../model/XiuxianData.js'
import assUtil from '../model/AssUtil.js'
import config from "../../../model/Config.js"
import fs from "fs"
import {player_efficiency,ForwardMsg, shijianc,Add_lingshi, Read_level, Read_wealth, Write_wealth} from "../../../apps/Xiuxian/Xiuxian.js";
import { segment } from "oicq"

//要DIY的话，确保这两个数组长度相等
const numberMaximums = [6, 8, 10, 13, 16, 18, 20 ,23 ,25];
const spiritStoneAnsMax = [2000000, 5000000, 8000000, 11000000, 15000000, 20000000 ,35000000, 50000000, 80000000];
/**
 * 宗门
 */
export class Association extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'Association',
            /** 功能描述 */
            dsc: '宗门模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: '^#申请加入.*$',
                    fnc: 'Join_association'
                },
                {
                    reg: '^#退出宗门$',
                    fnc: 'Exit_association'
                },
                {
                    reg: '^#宗门(上交|上缴|捐赠)灵石.*$',
                    fnc: 'give_association_lingshi'
                },
                {
                    reg: '^#宗门俸禄$',
                    fnc: 'gift_association'
                },
                {
                    reg: '^#(宗门列表)$',
                    fnc: 'List_appointment'
                },
                {
                    reg: "^#我的宗门$",
                    fnc: "show_association",
                }
            ]
        })
        this.xiuxianConfigData = config.getConfig("xiuxian", "xiuxian");
    }



    async show_association(e){
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
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        const assRelation = assUtil.assRelationList.find(item => item.id ==  ass.id);
        let msg = [
            `__[${assRelation.name}]__`
        ];

        for( let item in ass.allMembers){
            const qqNum = ass.allMembers[item];
            const player = await Read_level(qqNum);
            const assPlayerA =assUtil.getAssOrPlayer(1,qqNum);
            msg.push("QQ：" + qqNum+"\n" +"权限等级：" + assPlayerA.assJob + "\n" + "境界：" + player.levelname + "\n" +"历史贡献值：" + assPlayerA.historyContribution);
        }
        await ForwardMsg(e, msg);
        return ;
    }



    //宗门俸禄
    async gift_association(e) {
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

        let now = new Date();
        const nowTime = now.getTime(); //获取当前日期的时间戳
        const oldTime = assPlayer.time[1];
        const days=Math.trunc((nowTime - oldTime)/(24*60*60*1000));
        if(assPlayer.contributionPoints<=0 || assPlayer.historyContribution < days){
            e.reply(`你对宗门做成的贡献不足，没有领取俸禄的资格！！！`);
            return ;
        }
        let Today = await shijianc(nowTime);
        let lasting_time = await shijianc(assPlayer.lastSignAss);//获得上次宗门签到日期
        if (Today.Y == lasting_time.Y && Today.M == lasting_time.M && Today.D == lasting_time.D) {
            e.reply(`今日已经领取过了`);
            return;
        }
        if(ass.facility[4].status === 0){
            e.reply(`聚灵阵破烂不堪，导致灵石池无法存取灵石，快去修建！`);
            return;
        }

        const giftNumber = ass.level * 100 * assPlayer.assJob;
        if((ass.spiritStoneAns-giftNumber) < 0){
            e.reply(`宗门灵石池不够发放俸禄啦，快去为宗门做贡献吧`);
            return ;
        }
        ass.spiritStoneAns-=giftNumber;
        ass.facility[4].buildNum -= 1;
        assPlayer.contributionPoints -= 1;
        assPlayer.lastSignAss = nowTime;
        await Add_lingshi(usr_qq, giftNumber);
        await assUtil.checkFacility(ass);
        await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
        let msg = [
            segment.at(usr_qq),
            `宗门俸禄领取成功,获得了${giftNumber}灵石`
        ]
        e.reply(msg);
        return;
    }



    //加入宗门
    async Join_association(e) {
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);

        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const player = await Read_level(usr_qq);
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName != 0 || assPlayer.volunteerAss !=0){
            e.reply(`你已有宗门或已有意向宗门，请先清空志愿`);
            return;
        }

        let association_name = e.msg.replace("#申请加入", '');
        association_name = association_name.trim();
        const assRelation = assUtil.assRelationList.find(item => item.name == association_name);
        if (!isNotNull(assRelation)) {
            return;
        }
        association_name =assRelation.id;
        const ass = assUtil.getAssOrPlayer(2,association_name);
        const now_level = data.Level_list.find(item => item.id == player.level_id);
        const mostMem = numberMaximums[ass.level - 1];//该宗门目前人数上限
        const nowMem = ass.allMembers.length;//该宗门目前人数
        if (mostMem <= nowMem) {
            e.reply(`${assRelation.name}的弟子人数已经达到目前等级最大,无法加入`);
            return;
        }

        assPlayer.volunteerAss=association_name;
        ass.applyJoinList.push(usr_qq);
        await assUtil.setAssOrPlayer("association",association_name,ass);
        await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
        e.reply(`已成功发出申请！`)
        return ;
    }


    //退出宗门
    async Exit_association(e) {
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }

        const now = new Date();
        const nowTime = now.getTime(); //获取当前时间戳
        let addTime;

        const time=this.xiuxianConfigData.CD.joinassociation;//分钟

        addTime = assPlayer.time[1] + 60000 * time;

        if (addTime > nowTime) {
            e.reply("加入宗门不满" + `${time}小时,无法退出`);
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        if (assPlayer.assJob < 10) {
            ass.allMembers = ass.allMembers.filter( item => item != assPlayer.qqNumber);//原来的职位表删掉这个B
            assPlayer.assName=0;
            assPlayer.assJob=0;
            assPlayer.favorability=0;
            await assUtil.setAssOrPlayer("association",ass.id, ass);//记录到存档
            await assUtil.assEffCount(assPlayer);
            await player_efficiency(usr_qq);
            e.reply("退出宗门成功");
        } else {
            if (ass.allMembers.length < 2) {
                fs.rmSync(`${assUtil.filePathMap.association}/${assPlayer.assName}.json`);
                assPlayer.assName=0;
                assPlayer.assJob=0;
                assPlayer.favorability=0;
                await assUtil.assEffCount(assPlayer);
                await player_efficiency(usr_qq);
                e.reply("退出宗门成功,退出后宗门空无一人,自动解散");
            } else {
                ass.allMembers = ass.allMembers.filter( item => item != assPlayer.qqNumber);
                assPlayer.assName=0;
                assPlayer.assJob=0;
                assPlayer.favorability=0;
                await assUtil.assEffCount(assPlayer);
                await player_efficiency(usr_qq);
                let randMember = {"assJob":0};
                for( let item in ass.allMembers){
                    const qqNum = ass.allMembers[item];
                    const assPlayerA =assUtil.getAssOrPlayer(1,qqNum);
                    if(assPlayerA.assJob > randMember.assJob){
                        randMember = assPlayerA;
                    }
                }
                ass.master= randMember.qqNumber;
                randMember.assJob = 10;
                await assUtil.setAssOrPlayer("association",ass.id, ass);//记录到存档
                await assUtil.assEffCount(randMember);
                await player_efficiency(randMember.qqNumber);
                e.reply(`退出宗门成功,退出后,宗主职位由[${randMember.qqNumber}]接管`);
            }
        }
        return;
    }


    //捐赠灵石
    async give_association_lingshi(e) {
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const player = await Read_wealth(usr_qq);
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }

        let reg = new RegExp(/#宗门(上交|上缴|捐赠)灵石/);
        let lingshi = e.msg.replace(reg, '');
        lingshi = lingshi.trim();//去掉空格
        if(!isNaN(parseFloat(lingshi)) && isFinite(lingshi)){
        }else{
            return;
        }

        if (parseInt(lingshi) == parseInt(lingshi) && parseInt(lingshi) > 0) {
            lingshi = parseInt(lingshi);
        }
        else {
            return;
        }
        if (player.lingshi < lingshi) {
            e.reply(`你身上只有${player.lingshi}灵石,数量不足`);
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        const assRelation = assUtil.assRelationList.find(item => item.id == assPlayer.assName);

        if (ass.spiritStoneAns + lingshi > spiritStoneAnsMax[ass.level - 1]) {
            e.reply(`${assRelation.name}的灵石池最多还能容纳${spiritStoneAnsMax[ass.level - 1] - ass.spiritStoneAns}灵石,请重新捐赠`);
            return;
        }
        ass.spiritStoneAns += lingshi;
        assPlayer.contributionPoints += Math.trunc(lingshi/1000);
        assPlayer.historyContribution += Math.trunc(lingshi/1000);
        player.lingshi -= lingshi;
        await Write_wealth(usr_qq,player);
        await assUtil.setAssOrPlayer("association",ass.id, ass);
        await assUtil.setAssOrPlayer("assPlayer",assPlayer.qqNumber, assPlayer);
        e.reply(`捐赠成功,你身上还有${player.lingshi}灵石,宗门灵石池目前有${ass.spiritStoneAns}灵石`);
        return;
    }



    //宗门列表
    async List_appointment(e) {
         //不开放私聊功能
         if (!e.isGroup) {
            return;
        }
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay) { return; }
        const dir = assUtil.filePathMap.association;
        let File = fs.readdirSync(dir);
        File = File.filter(file => file.endsWith(".json"));

        let temp = ["宗门列表"];
        if (File.length == 0) {
            temp.push("暂时没有宗门数据");
        }

        for (let i = 0; i < File.length; i++) {
            const this_name = File[i].replace(".json", '');
            const assRelation = assUtil.assRelationList.find(item => item.id == this_name);
            const this_ass = await assUtil.getAssOrPlayer(2,this_name);
            let this_ass_xiuxian=0;
            if(this_ass.resident.name == 0){
                this_ass_xiuxian="无驻地";
            }else {
                this_ass_xiuxian=this_ass.resident.name;
            }
            let this_ass_beast = this_ass.divineBeast==0 ?"无神兽":this_ass.divineBeast ;
            temp.push(`序号:${1 + i} ` + '\n' + `宗名: ${assRelation.name}` + '\n' + `人数: ${this_ass.allMembers.length}/${numberMaximums[this_ass.level - 1]}` +
                "\n" + `等级: ${this_ass.level}` + '\n' + `宗门驻地: ${this_ass_xiuxian}` + '\n' +
                `宗主: ${this_ass.master}`+ '\n' +
                `宗门神兽: ${this_ass_beast}`
            );
        }
        await ForwardMsg(e, temp);
        return;
    }

}





/**
 * 判断对象是否不为undefined且不为null
 * @param obj 对象
 * @returns obj==null/undefined,return false,other return true
 */
function isNotNull(obj) {
    if (obj == undefined || obj == null)
        return false;
    return true;
}




async function get_random_fromARR(ARR) {
    let randindex = Math.trunc(Math.random() * ARR.length);
    return ARR[randindex];
}

