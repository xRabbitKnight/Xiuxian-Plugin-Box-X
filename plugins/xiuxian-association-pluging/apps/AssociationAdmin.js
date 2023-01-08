import plugin from '../../../../../lib/plugins/plugin.js'
import assUtil from '../model/AssUtil.js'
import { Read_najie, Write_najie,timestampToTime,player_efficiency,Add_najie_thing,
    exist_najie_thing_id,existplayerplugins,
    Read_level,
    Read_wealth,
    Write_wealth} from "../../../apps/Xiuxian/Xiuxian.js";


//要DIY的话，确保这两个数组长度相等
const numberMaximums = [6, 8, 10, 13, 16, 18, 20 ,23 ,25];
const spiritStoneAnsMax = [2000000, 5000000, 8000000, 11000000, 15000000, 20000000 ,35000000, 50000000, 80000000];

/**
 * 宗门
 */

export class AssociationAdmin extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'AssociationAdmin',
            /** 功能描述 */
            dsc: '宗门模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: '^#开宗立派$',
                    fnc: 'Create_association'
                },
                {
                    reg: '^#(升级宗门|宗门升级)$',
                    fnc: 'lvup_association'
                },
                {
                    reg: '^#提拔.*',
                    fnc: 'Set_appointment'
                },
                {
                    reg: '^#逐出门派.*$',
                    fnc: 'Deleteusermax'
                },
                {
                    reg: "^#宗门改名.*$",
                    fnc: 'AssRename'
                }
            ]
        })
    }




    //判断是否满足创建宗门条件
    async Create_association(e) {
        const usr_qq = e.user_id;
        const ifexistplay = await existplayerplugins(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const player = await Read_wealth(usr_qq);
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName != 0 || assPlayer.volunteerAss !=0){
            e.reply(`你已有宗门或已有意向宗门，请先清空志愿`);
            return;
        }
        if (player.lingshi < 10000) {
            e.reply("开宗立派是需要本钱的,攒到一万灵石再来吧");
            return;
        }

        //是否存在宗门令牌      否，return
        //是 令牌为中级或低级
        //中，是否四大隐藏有主            是，检测低级，否，随机获取四大宗门
        //低，进行普通创建

        let najieThingA =await exist_najie_thing_id(usr_qq,"6-2-41");
        let najieThingB =await exist_najie_thing_id(usr_qq,"6-2-42");

        if(najieThingA == 1){
            e.reply(`你尚无创建宗门的资格，请获取下等宗门令牌后再来吧`);
            return ;
        }
        //有令牌，可以开始创建宗门了
        if(najieThingB !=1){
            //有中级令牌
            //判断隐藏宗门是否被占完了

            let assName = [];
            assUtil.existAss("association","Ass000001") ? "":assName.push("Ass000001");
            assUtil.existAss("association","Ass000002") ? "":assName.push("Ass000002");
            assUtil.existAss("association","Ass000003") ? "":assName.push("Ass000003");
            assUtil.existAss("association","Ass000004") ? "":assName.push("Ass000004");


            if(assName.length !=0){
                //可以创建隐藏宗门
                player.lingshi -= 10000;
                await Write_wealth(usr_qq,player);

                let najie = await Read_najie(usr_qq);
                najie = await Add_najie_thing(najie, najieThingB, -1);
                await Write_najie(usr_qq, najie);
                const now = new Date();
                const nowTime = now.getTime(); //获取当前时间戳
                const date =  timestampToTime(nowTime);

                const location = Math.floor(Math.random() * assName.length);
                const association = {
                    "id": assName[location],
                    "level": 4,
                    "createTime": [date, nowTime],
                    "spiritStoneAns": 100000,
                    "resident": {
                        "id": 0,
                        "name": 0,
                        "level": 0
                    },
                    "facility": [
                        {
                            "buildNum": 0,
                            "status": 0,
                            "more2": 0,
                            "more3": 0
                        },
                        {
                            "buildNum": 0,
                            "status": 0,
                            "more2": 0,
                            "more3": 0
                        },
                        {
                            "buildNum": 0,
                            "status": 0,
                            "more2": 0,
                            "more3": 0
                        },
                        {
                            "buildNum": 0,
                            "status": 0,
                            "more2": 0,
                            "more3": 0
                        },
                        {
                            "buildNum": 0,
                            "status": 0,
                            "more2": 0,
                            "more3": 0
                        },
                        {
                            "buildNum": 0,
                            "status": 0,
                            "more2": 0,
                            "more3": 0
                        },
                        {
                            "buildNum": 0,
                            "status": 0,
                            "more2": 0,
                            "more3": 0
                        }
                    ],
                    "divineBeast": 0,
                    "master": usr_qq+"",
                    "allMembers": [usr_qq+"",],
                    "applyJoinList": [],
                    "more1": 0,
                    "more2": 0,
                    "more3": 0
                }


                let assPlayer = assUtil.getAssOrPlayer(1, usr_qq);
                assPlayer.assName = assName[location];
                assPlayer.assJob = 10;
                assPlayer.contributionPoints=0;
                assPlayer.historyContribution=0;
                assPlayer.favorability=0;
                assPlayer.volunteerAss=0;
                assPlayer.time = [date, nowTime];
                await assUtil.setAssOrPlayer("association",assName[location], association);
                await assUtil.assEffCount(assPlayer);
                let assRelation = assUtil.assRelationList.find(item => item.id == assName[location]);
                e.reply(`恭喜你找到了${assRelation.name}遗址，继承其传承，建立了隐藏宗门${assRelation.name}！！！`)
                return ;
            }
        }

        //隐藏宗门没了，只能创建普通宗门，判断有无低级令牌
        if(najieThingA !=1){
            player.lingshi -= 10000;
            await Write_wealth(usr_qq,player);
            let najie =await Read_najie(usr_qq);
            await Add_najie_thing(najie,najieThingA,-1);
            await Write_najie(usr_qq,najie);
            //有低级令牌，可以创建普通宗门
            /** 设置上下文 */
            this.setContext('Get_association_name');
            /** 回复 */
            await e.reply('请发送宗门的名字,后续可使用#宗门改名xxx进行修改(宗门名字最多6个中文字符)', false, { at: true });
            return;
        }
    }

    /** 获取宗门名称 */
    async Get_association_name(e) {
        const usr_qq = e.user_id;
        /** 内容 */
         //不开放私聊功能
         if (!e.isGroup) {
            return;
        }
        const new_msg = this.e.message;
        if (new_msg[0].type != "text") {
            this.setContext('Get_association_name');
            await this.reply('请发送文本,请重新输入:');
            return;
        }
        const association_name = new_msg[0].text;
        if (association_name.length > 6) {
            this.setContext('Get_association_name');
            await this.reply('宗门名字最多只能设置6个字符,请重新输入:');
            return;
        }
        const reg = /[^\u4e00-\u9fa5]/g;//汉字检验正则
        const res = reg.test(association_name);
        //res为true表示存在汉字以外的字符
        if (res) {
            this.setContext('Get_association_name');
            await this.reply('宗门名字只能使用中文,请重新输入:');
            return;
        }
        const assRelation = assUtil.assRelationList.find(item => item.name == association_name);

        if (isNotNull(assRelation)) {
            this.setContext('Get_association_name');
            await this.reply('该宗门已经存在,请重新输入:');
            return;
        }

        const now = new Date();
        const nowTime = now.getTime(); //获取当前时间戳
        const date =  timestampToTime(nowTime);
        const assPlayer = assUtil.getAssOrPlayer(1, usr_qq);
        const id = assUtil.assRelationList[assUtil.assRelationList.length - 1].id;
        const replace = Number(id.replace("Ass00000","")) + 1;
        const association_id = "Ass00000"+ replace;

        const relation =   {
                "id": association_id,
                "name": association_name,
                "unchartedName": association_id
            };
        let relationAll = assUtil.assRelationList;
        relationAll.push(relation);
        await assUtil.setAssOrPlayer("assRelation","AssRelation",relationAll);
        assPlayer.assName = association_id;
        assPlayer.assJob = 10;
        assPlayer.contributionPoints=0;
        assPlayer.historyContribution=0;
        assPlayer.favorability=0;
        assPlayer.volunteerAss=0;
        assPlayer.time = [date, nowTime];
        await assUtil.setAssOrPlayer("assPlayer", usr_qq, assPlayer);
        await new_Association(association_id, usr_qq);
        await assUtil.assEffCount(assPlayer);
        await this.reply('宗门创建成功');
        /** 结束上下文 */
        this.finish('Get_association_name');
        //return association_name;
    }




    //升级宗门
    async lvup_association(e) {
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob < 8){
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        if (ass.level == numberMaximums.length) {
            return;
        }
        if (ass.spiritStoneAns < ass.level * 30000) {
            e.reply(`本宗门目前灵石池中仅有${ass.spiritStoneAns}灵石,当前宗门升级需要${ass.level * 30000}灵石,数量不足`);
            return;
        }

        const najieThingA =await exist_najie_thing_id(usr_qq,"6-2-42");
        const najieThingB =await exist_najie_thing_id(usr_qq,"6-2-43");

        let najie =await Read_najie(usr_qq);

        if (ass.level == 3){
            if(najieThingA == 1){
                e.reply(`升级中等宗门需要对应令牌，快去获取吧`);
                return ;
            }
            najie = await Add_najie_thing(najie, najieThingA, -1);
        }


        if (ass.level == 6){
            if(najieThingB == 1){
                e.reply(`升级上等宗门需要对应令牌，快去获取吧`);
                return ;
            }
            najie = await Add_najie_thing(najie, najieThingB, -1);

        }

        ass.spiritStoneAns -= ass.level * 30000;
        ass.level += 1;
        await assUtil.setAssOrPlayer("association",ass.id, ass);
        await Write_najie(usr_qq,najie);
        const playerList = ass.allMembers;
        for (let player_id of playerList) {
            const usr_qq = player_id;
            if(assUtil.existAss("assPlayer",usr_qq)){
                const assOrPlayer = assUtil.getAssOrPlayer(1,usr_qq);
                assUtil.assEffCount(assOrPlayer);
                await player_efficiency(usr_qq);
            }
        }
        e.reply("宗门升级成功" + `当前宗门等级为${ass.level},宗门人数上限提高到:${numberMaximums[ass.level - 1]}`);
        return;
    }


    //任命职位
    async Set_appointment(e) {
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob < 10){
            return;
        }
        let  member_qq = e.msg.replace("#提拔", '');
        member_qq = member_qq.trim();
        if (usr_qq == member_qq) {
            return;
        }
        const ass = await assUtil.getAssOrPlayer(2,assPlayer.assName);
        const isinass = ass.allMembers.find(item => item == member_qq);
        if (!isinass) {
            return;
        }

        const member = assUtil.getAssOrPlayer(1, member_qq);//获取这个B的存档
        if(member.assJob > 5){
            e.reply(`他已经是内门弟子了，不能再提拔了`);
            return ;
        }
        if(member.historyContribution < (member.assJob+1) *100){
            e.reply(`他的资历太浅，贡献不足，贸然提拔也许不能服众`);
            return ;
        }

        member.assJob += 1;
        await assUtil.assEffCount(member);
        await player_efficiency(member.qqNumber);

        e.reply(`提拔成功！！！`);
        return ;

    }



    async AssRename(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        if(assPlayer.assName == 0 || assPlayer.assJob < 10) {
            return;
        }
        if(assUtil.assRelationList.findIndex(item => item.id == ass.id) <= 3){
            e.reply(`请好好继承隐藏宗门的传承吧，就不要想着改名了!!!`);
            return ;
        }
        let association_name = e.msg.replace("#宗门改名", '');
        association_name = association_name.trim();

        if (ass.spiritStoneAns < 10000) {
            e.reply(`宗门更名需要1w灵石,攒够钱再来吧`);
            return;
        }
        ass.spiritStoneAns -=10000;
        await assUtil.setAssOrPlayer("association",ass.id,ass);
        await assUtil.assRename(ass.id,1,association_name);
        e.reply(`改名成功，宗门当前名称为${association_name}`);
        return ;
    }


    async Deleteusermax(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        const playerA = assUtil.getAssOrPlayer(1,usr_qq);
        if(playerA.assName == 0 || playerA.assJob <8) {
            return;
        }

        let menpai = e.msg.replace("#", '');
        menpai = menpai.replace("逐出门派", '');
        const member_qq = menpai;
        if (usr_qq == member_qq) {
            return;
        }
        const playerB = await assUtil.getAssOrPlayer(1,member_qq);
        if(playerB.assName == 0){
            return;
        }
        const bss = assUtil.getAssOrPlayer(2,playerB.assName);
        if(playerA.assName!=playerB.assName){
            return;
        }
        if (playerB.assJob >= 8) {
            e.reply(`无权进行此操作`);
            return;
        }
        bss.allMembers = bss.allMembers.filter(item => item != member_qq);
        playerB.favorability=0;
        playerB.assJob=0;
        playerB.assName=0;
        await assUtil.setAssOrPlayer("association",bss.id, bss);
        await assUtil.assEffCount(playerB);
        await player_efficiency(member_qq);
        e.reply("已踢出！");
        return ;
    }

}


/**
 * 创立新的宗门
 * @param name 宗门名称
 * @param holder_qq 宗主qq号
 */
async function new_Association(name, holder_qq) {
    let now = new Date();
    let nowTime = now.getTime(); //获取当前时间戳
    let date = timestampToTime(nowTime);
    let Association = {
        "id": name,
        "level": 1,
        "createTime": [date, nowTime],
        "spiritStoneAns": 0,
        "resident": {
            "id": 0,
            "name": 0,
            "level": 0
        },
        "facility": [
            {
                "buildNum": 0,
                "status": 0,
                "more2": 0,
                "more3": 0
            },
            {
                "buildNum": 0,
                "status": 0,
                "more2": 0,
                "more3": 0
            },
            {
                "buildNum": 0,
                "status": 0,
                "more2": 0,
                "more3": 0
            },
            {
                "buildNum": 0,
                "status": 0,
                "more2": 0,
                "more3": 0
            },
            {
                "buildNum": 0,
                "status": 0,
                "more2": 0,
                "more3": 0
            },
            {
                "buildNum": 0,
                "status": 0,
                "more2": 0,
                "more3": 0
            },
            {
                "buildNum": 0,
                "status": 0,
                "more2": 0,
                "more3": 0
            }
        ],

        "divineBeast":0,

        "master": holder_qq+"",
        "allMembers": [holder_qq+"",],
        "applyJoinList": [],
        "more1":0,
        "more2":0,
        "more3":0
    }


    let treasureVault = [[],[],[]];

    assUtil.setAssOrPlayer("association",name, Association);
    assUtil.setAssOrPlayer("assTreasureVault",name, treasureVault);
    return;
}



async function switchJobName(job) {
    let jobList=["内门弟子","外门弟子","杂役"];
    let location = jobList.findIndex( item=> item == job);
    switch (location) {
        case 0:
            job=5;
            break;
        case 1:
            job=3;
            break;
        case 2:
            job=1;
            break;
        default:
            job=1;
            break;
    }
    return job;

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





