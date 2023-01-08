import plugin from '../../../../../lib/plugins/plugin.js'
import assUtil from '../model/AssUtil.js'
import {timestampToTime,player_efficiency,isNotNull,ForwardMsg, Read_level}  from "../../../apps/Xiuxian/Xiuxian.js";


//要DIY的话，确保这两个数组长度相等
const numberMaximums = [6, 8, 10, 13, 16, 18, 20 ,23 ,25];
const spiritStoneAnsMax = [2000000, 5000000, 8000000, 11000000, 15000000, 20000000 ,35000000, 50000000, 80000000];
/**
 * 宗门
 */
export class AssociationJoin extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'AssociationJoin',
            /** 功能描述 */
            dsc: '宗门模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: '^#查看简历.*$',
                    fnc: 'View_Resume'
                },
                {
                    reg: '^#批准录取.*$',
                    fnc: 'Approval_Admission'
                },
                {
                    reg: '^#驳回申请.*$',
                    fnc: 'Denial_Application'
                },
                {
                    reg: '^#清空志愿$',
                    fnc: 'Clear_Volunteer'
                },
                {
                    reg: '^#展示所有简历$',
                    fnc: 'Show_All_Resume'
                }
            ]
        })
    }



    async View_Resume(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const joinQQ = e.msg.replace("#查看简历", '');
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0) {
            return;
        }
        const joinPlayer = await Read_level(joinQQ);
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        const find = ass.applyJoinList.findIndex(item => item == joinQQ);
        if(find == -1){
            return ;
        }

        if(assPlayer.assJob <8){
            e.reply(`权限不足`);
            return ;
        }


        let msg = `qq号:${joinQQ} ` + '\n' + '\n' + `练气境界: ${joinPlayer.levelname}` +
            "\n" + `境界阶段: ${joinPlayer.rank_name}` + '\n' + `炼体境界: ${joinPlayer.levelnamemax}` + '\n';
        e.reply(msg);
        return ;

    }


    async Clear_Volunteer(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);

        if(assPlayer.volunteerAss == undefined){
            assPlayer.volunteerAss = 0;
            await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
            return ;
        }

        if(assPlayer.volunteerAss == 0){
            return ;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.volunteerAss);
        if(!isNotNull(ass)){
            assPlayer.volunteerAss=0;
            await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
            e.reply(`清除成功！`);
            return ;
        }else {
            assPlayer.volunteerAss=0;
            ass.applyJoinList = ass.applyJoinList.filter(item => item!=usr_qq);
            await assUtil.setAssOrPlayer("assPlayer",usr_qq,assPlayer);
            await assUtil.setAssOrPlayer("association",ass.id,ass);
            e.reply(`清除成功！`);
            return ;
        }


    }

    async Approval_Admission(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        const joinQQ = e.msg.replace("#批准录取", '');
        if (!ifexistplay || !e.isGroup || !assUtil.existAss("assPlayer",joinQQ)) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        const find = ass.applyJoinList.findIndex(item => item == joinQQ);
        if(find == -1){
            return ;
        }
        const joinPlayer = assUtil.getAssOrPlayer(1,joinQQ);

        if(assPlayer.assJob >= 8){

            const now = new Date();
            const nowTime = now.getTime(); //获取当前时间戳
            const date = timestampToTime(nowTime);
            joinPlayer.assName=ass.id;
            joinPlayer.assJob=1;
            joinPlayer.volunteerAss=0;
            joinPlayer.time=[date, nowTime];

            ass.allMembers.push(joinQQ);
            ass.applyJoinList = ass.applyJoinList.filter(item => item != joinQQ);
            await assUtil.setAssOrPlayer("association",ass.id, ass);
            await assUtil.assEffCount(joinPlayer);
            await player_efficiency(joinQQ);
            e.reply(`已批准${joinQQ}的入宗申请，恭喜你的宗门又招收到一位新弟子`);
            return;

        }else {
            e.reply(`你没有权限`);
            return ;
        }

    }

    async Denial_Application(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const joinQQ = e.msg.replace("#驳回申请", '');

        if (!ifexistplay || !e.isGroup || !assUtil.existAss("assPlayer",joinQQ)) {
            return;
        }

        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob <8){
            return;
        }

        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        let find = ass.applyJoinList.findIndex(item => item == joinQQ);
        if(find == -1){
            return ;
        }

        const joinPlayer = assUtil.getAssOrPlayer(1,joinQQ);

        joinPlayer.volunteerAss=0;
        ass.applyJoinList = ass.applyJoinList.filter(item => item!=joinQQ);
        await assUtil.setAssOrPlayer("assPlayer",joinQQ,joinPlayer);
        await assUtil.setAssOrPlayer("association",ass.id,ass);
        e.reply(`已拒绝！`);
        return ;
    }

    async Show_All_Resume(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 ||assPlayer.assJob <8){
            return;
        }
        let ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        if(ass.applyJoinList.length == 0){
            e.reply(`你的宗门还没有收到任何简历！！！快去招收弟子吧！`);
            return ;
        }
        let temp = ["简历列表"];

        for (var i = 0; i < ass.applyJoinList.length; i++) {
            temp.push(`序号:${1 + i} ` + '\n' + `申请人QQ: ${ass.applyJoinList[i]}` + '\n');
        }
        await ForwardMsg(e, temp);
        return;

    }


}


