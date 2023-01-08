import plugin from '../../../../../lib/plugins/plugin.js'
import assUtil from '../model/AssUtil.js'
import {Write_level, Read_level,battle,Read_action}  from "../../../apps/Xiuxian/Xiuxian.js";

//要DIY的话，确保这两个数组长度相等
const numberMaximums = [6, 8, 10, 13, 16, 18, 20 ,23 ,25];
const spiritStoneAnsMax = [2000000, 5000000, 8000000, 11000000, 15000000, 20000000 ,35000000, 50000000, 80000000];
/**
 * 宗门
 */
export class AssociationJobUp extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'AssociationJobUp',
            /** 功能描述 */
            dsc: '宗门模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: '^#宗门职位提升$',
                    fnc: 'FetchJob'
                },
                {
                    reg: '^#谋权篡位$',
                    fnc: 'Commit_Regicide'
                },
                {
                    reg: '^#发起职位挑战.*$',
                    fnc: 'Launch_Job_Challenge'
                }
            ]
        })
    }

    async FetchJob(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0
            || assPlayer.assJob > 9
            || assPlayer.contributionPoints < 400) {
            return;
        }
        assPlayer.contributionPoints -=400;
        assPlayer.assJob+=1;
        await assUtil.assEffCount(assPlayer);
        e.reply(`职位提升成功！`);
        return ;
    }

    async Commit_Regicide(e){

        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob >=10) {
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);

        const actionA = await Read_action(usr_qq);
        const actionB = await Read_action(ass.master);
        if(actionA.region!=actionB.region){
            e.reply('没有找到宗主的位置！');
            return;
        };

        const victory = await battle(e,usr_qq,ass.master);
        const userLevel=await Read_level(usr_qq);

        if(victory==usr_qq){
            assPlayer.assJob =10;
            ass.allMembers = ass.allMembers.filter( item => item != ass.master);
            const masterPlayer = assUtil.getAssOrPlayer(1,ass.master);
            masterPlayer.assName=0;
            masterPlayer.assJob=0;
            masterPlayer.favorability=0;
            await assUtil.assEffCount(masterPlayer);
            ass.master =usr_qq;
            userLevel.prestige +=8;
            e.reply(`谋划数载，篡位成功，你成功坐上了宗主之位，但也因为这一行为魔力值增加8点`);
        }else {
            ass.allMembers = ass.allMembers.filter( item => item != usr_qq);
            assPlayer.assName=0;
            assPlayer.assJob=0;
            assPlayer.favorability=0;
            assPlayer.contributionPoints = 0;
            userLevel.prestige +=15;
            e.reply(`你谋划篡位，被宗主识破了，不仅被逐出宗门，还让增加了15点魔力值`);
        }
        await assUtil.assEffCount(assPlayer);
        await assUtil.setAssOrPlayer("association",ass.id,ass);
        await Write_level(usr_qq, userLevel);
        return ;
    }

    async Launch_Job_Challenge(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }


        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob >= 8) {
            return;
        }
        if(assPlayer.contributionPoints < 200){
            e.reply(`你没有足够的贡献点作为比试的彩头，对方不接受你的挑战`);
            return ;
        }

        const battleQQ = e.msg.replace("#发起职位挑战", '');
        const ifexists = await assUtil.existArchive(battleQQ);
        if(!ifexists || !assUtil.existAss("assPlayer",battleQQ)){
            return;
        }
        const battlePlayer = assUtil.getAssOrPlayer(1,battleQQ);
        if(battlePlayer.assName == 0
            || assPlayer.assName != battlePlayer.assName
            || battlePlayer.assJob >= 10
            || battlePlayer.assJob < assPlayer.assJob
            || battlePlayer.assJob > assPlayer.assJob+2) {
            return;
        }
        const actionA = await Read_action(usr_qq);
        const actionB = await Read_action(battleQQ);
        if(actionA.region!=actionB.region){
            e.reply('没有找到对方在哪里，无法挑战！');
            return;
        };

        const victory = await battle(e,usr_qq,battleQQ);
        if(victory==usr_qq){

            assPlayer.assJob+=1;
            battlePlayer.assJob -=1;
            await assUtil.assEffCount(assPlayer);
            await assUtil.assEffCount(battlePlayer);
            e.reply(`你在赢得了比试的胜利，职位等级提高了，对方的职位等级降低一级`);
            return ;
        }else {
            assPlayer.contributionPoints -=200;
            battlePlayer.contributionPoints +=200;
            await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
            await assUtil.setAssOrPlayer("assPlayer",battleQQ,battlePlayer);
            e.reply(`你技不如人，不仅没提高职位等级，还要给对方200贡献点！`);
            return ;
        }
    }



}


