import plugin from '../../../../../lib/plugins/plugin.js'
import assUtil from '../model/AssUtil.js'
import fs from "fs"
import {ForwardMsg,shijianc,Read_battle, Read_level,Read_action,Write_level} from "../../../apps/Xiuxian/Xiuxian.js";

const buildNameList = ["山门","藏宝阁","宗门秘境","神兽道场","聚灵阵","护宗大阵","修炼室"];
const spiritStoneAnsMax = [2000000, 5000000, 8000000, 11000000, 15000000, 20000000 ,35000000, 50000000, 80000000];

/**
 * 洞天福地
 */
export class BlessPlace extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'BlessPlace',
            /** 功能描述 */
            dsc: '宗门驻地模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 9999,
            rule: [
                {
                    reg: '^#洞天福地列表$',
                    fnc: 'List_blessPlace'
                },
                {
                    reg: '^#开采灵脉$',
                    fnc: 'exploitation_vein'
                },
                {
                    reg: '^#入驻洞天.*$',
                    fnc: 'Settled_Blessed_Place'
                },
                {
                    reg: '^#修建.*$',
                    fnc: 'construction_Guild'
                },
                {
                    reg: '^#查看宗门建筑$',
                    fnc: 'show_Association_Builder'
                },
                {
                    reg: '^#集合攻打.*$',
                    fnc: 'Association_Battle'
                }
            ]
        })
    }



    async Association_Battle(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob < 8 ){
            return;
        }
        let assName = await e.msg.replace("#集合攻打", '');
        assName =assName.trim();
        const assRelation = assUtil.assRelationList.find(item => item.name == assName);
        if (!isNotNull(assRelation)) {
            e.reply(`该宗门不存在！`);
            return;
        }

        assName =assRelation.id;
        const battleAss = assUtil.getAssOrPlayer(2,assName);
        if(battleAss.resident.name==0 || battleAss.id == assPlayer.assName){
            return ;
        }
        //读取被攻打的宗门势力范围
        const attackAss = assUtil.getAssOrPlayer(2,assPlayer.assName);
        const position = JSON.parse(fs.readFileSync(`${assUtil.position}/position.json`)).find(item => item.name == battleAss.resident.name);
        const attack =await getFightMember(attackAss.allMembers,position);
        const battle =await getFightMember(battleAss.allMembers,position);
        let msg = [
            "___[战斗过程]___"
        ];
        msg.push("攻打方参与者："+attack.toString());
        msg.push("防守方参与者："+battle.toString());
        const attackObj =await SealingFormation(attack);
        msg.push("你们结成了攻伐大阵，誓要攻破对方的山门，抢夺下这块驻地！")
        const battleObj =await SealingFormation(battle);
        battleObj.defense +=Math.trunc(battleAss.facility[5].buildNum / 200) * 2500;
        msg.push("防守方依托宗门大阵，誓要将你们击退！");
        switch(battleAss.divineBeast){
            case 1:
                battleObj.burst +=25;
                msg.push("麒麟祥瑞降临，防守方变得幸运，更容易打出暴击了！");
                break;
            case 2:
                battleObj.nowblood += 50000;
                msg.push("青龙属木主生机，降下生命赐福，防守方血量提升了！");
                break;
            case 3:
                battleObj.attack += 8000;
                msg.push("白虎属金主杀伐，降下攻击赐福，防守方伤害变高了！");
                break;
            case 4:
                battleObj.burstmax +=50;
                msg.push("朱雀属火主毁灭，降下伤害赐福，防守方爆伤提升了！");
                break;
            case 5:
                battleObj.defense +=8000;
                msg.push("玄武属水主守护，降下免伤赐福，防守方防御提升了！");
                break;
            default:
                msg.push("防守方没有神兽，并不能获得战斗加成");
        }
        msg.push("掀起宗门大战，波及范围甚广，有违天和，进攻方全体魔力值加2点");
        await ForwardMsg(e, msg);
        //开打！
        const res = await AssBattle(e,attackObj,battleObj);
        //赢！
        if(battleAss.facility[5].status != 0){
            battleAss.facility[5].buildNum -=200;
        }
        if(res == 1){
            battleAss.resident ={
                "id": 0,
                "name": 0,
                "level": 0
            };
            battleAss.facility=battleAss.facility.map(function (i) {
                i.buildNum=0;
                i.status=0;
                return i;
            });
        }
        await assUtil.checkFacility(battleAss);
        await AddPrestige(attack);
        return ;
    }


    //秘境地点
    async List_blessPlace(e) {
        //不开放私聊功能
        if (!e.isGroup) {
            return;
        }
        let addres="洞天福地";
        let weizhi = assUtil.blessPlaceList;
        await GoBlessPlace(e, weizhi, addres);
    }

    //入驻洞天
    async Settled_Blessed_Place(e){

        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob <10 ){
            await e.reply(`你的权限不够！`);
            return;
        }
        const ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        let  blessed_name = e.msg.replace("#入驻洞天", '');
        blessed_name = blessed_name.trim();
        //洞天不存在
        const dongTan = await assUtil.blessPlaceList.find(item => item.name == blessed_name);
        if (!isNotNull(dongTan)) {
            await e.reply(`洞天不存在！`);
            return;
        }
        const point = JSON.parse(fs.readFileSync(`${assUtil.position}/point.json`)).find(item => item.name == blessed_name);
        //取洞天点位，是否在位置，在--->是否被占领
        const action = await Read_action(usr_qq);
        if(Math.abs(action.x - point.x) > 10 || Math.abs(action.y - point.y) > 10){
            await e.reply(`请前往洞天后入驻！`);
            return ;
        }

        const dir = assUtil.filePathMap.association;
        let File = fs.readdirSync(dir);
        File = File.filter(file => file.endsWith(".json"));
        for (let i = 0; i < File.length; i++) {
            const this_name = File[i].replace(".json", '');
            const this_ass = await assUtil.getAssOrPlayer(2,this_name);
            if(this_ass.resident.name==dongTan.name){
                e.reply(`你尝试带着宗门入驻${dongTan.name}，却发现有宗门捷足先登了，只能通过开战强夺驻地了`);
                return ;
            }
        }
        ass.resident=dongTan;
        ass.facility=ass.facility.map(function (i) {
            i.buildNum=0;
            i.status=0;
            return i;
        });
        await assUtil.setAssOrPlayer("association",ass.id, ass);
        await e.reply(`入驻成功,${ass.id}当前驻地为：${dongTan.name}`);
        return ;

    }

    async exploitation_vein(e){
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

        if(ass.resident.name==0){
            e.reply(`你的宗门还没有驻地哦，没有灵脉可以开采`);
            return ;
        }

        const position = JSON.parse(fs.readFileSync(`${assUtil.position}/position.json`)).find(item => item.name == ass.resident.name);
        const action = await Read_action(usr_qq);
        if(action.x < position.x1
            || action.x > position.x2
            || action.y < position.y1
            || action.y > position.y2){
            e.reply(`请先回驻地范围`);
            return ;
        }
        const now = new Date();
        const nowTime = now.getTime(); //获取当前日期的时间戳
        const Today = await shijianc(nowTime);
        const lastExplorTime = await shijianc(assPlayer.lastExplorTime);//获得上次宗门签到日期
        if (Today.Y == lastExplorTime.Y && Today.M == lastExplorTime.M && Today.D == lastExplorTime.D) {
            e.reply(`今日已经开采过灵脉，不可以竭泽而渔哦，明天再来吧`);
            return;
        }
        assPlayer.lastExplorTime = nowTime;

        let gift_lingshi = 0 ;
        const player = await Read_level(usr_qq);
        gift_lingshi = 500 *  ass.resident.level * player.level_id;

        const num =Math.trunc(gift_lingshi);

        if (ass.spiritStoneAns + num > spiritStoneAnsMax[ass.level - 1]) {
            ass.spiritStoneAns=spiritStoneAnsMax[ass.level - 1];
        }else {
            ass.spiritStoneAns += num;
        }

        assPlayer.contributionPoints+=Math.trunc(num/2000);
        assPlayer.historyContribution+=Math.trunc(num/2000);
        await assUtil.setAssOrPlayer("association",ass.id, ass);
        await assUtil.setAssOrPlayer("assPlayer",usr_qq, assPlayer);
        e.reply(`本次开采灵脉为宗门灵石池贡献了${gift_lingshi}灵石，你获得了`+Math.trunc(num/2000)+`点贡献点`);

        return ;
    }



    async construction_Guild(e){
        const usr_qq = e.user_id;
        //用户不存在
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const player = await Read_level(usr_qq);
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){
            return;
        }

        let ass = await assUtil.getAssOrPlayer(2,assPlayer.assName);
        if(ass.resident.name==0){
            e.reply(`你的宗门还没有驻地，无法建设宗门`);
            return ;
        }

        let  buildName = e.msg.replace("#修建", '');
        buildName = buildName.trim();
        //洞天不存在
        const location = buildNameList.findIndex(item => item == buildName);
        if (location == -1) {
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

        if(location!=0 && ass.facility[0].status == 0){
            e.reply(`宗门驻地里连块平地都没有,你修建啥呀,先给山门修修吧`);
            return ;
        }

        const CDTime = 10;
        const ClassCD = ":buildFacility";
        const now_time = new Date().getTime();
        const cdSecond =await redis.ttl("xiuxian:player:" + usr_qq + ClassCD);
        if(cdSecond!= -2){
            if(cdSecond == -1){
                e.reply(`修建cd状态残留，请联系机器人管理员处理！`);
                return ;
            }
            e.reply(`修建cd中，剩余${cdSecond}秒！`);
            return ;
        }

        await redis.set("xiuxian:player:" + usr_qq + ClassCD ,now_time);
        await redis.expire("xiuxian:player:" + usr_qq + ClassCD , CDTime * 60);

        let add = Math.trunc(player.level_id/10)+3;

        ass.facility[location].buildNum+=add;


        assPlayer.contributionPoints+=Math.trunc(add/2)+1;
        assPlayer.historyContribution+=Math.trunc(add/2)+1;
        await assUtil.checkFacility(ass);
        ass = await assUtil.getAssOrPlayer(2,assPlayer.assName);
        let msg = ass.facility[location].status == 0 ? "未启用": "启用";
        await assUtil.setAssOrPlayer("assPlayer",usr_qq, assPlayer);
        e.reply(`建设成功，为${buildName}增加了${add}点建设值，当前该设施建设总值为${ass.facility[location].buildNum},状态为`+msg);
        return ;
    }

    async show_Association_Builder(e){
        const usr_qq = e.user_id;
        //用户不存在
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0){

            return;
        }

        const ass = await assUtil.getAssOrPlayer(2,assPlayer.assName);

        let msg = [`__[宗门建筑]__`];

        for(let i=0;i<ass.facility.length;i++){
            msg.push("建筑名称：" + buildNameList[i]+"\n" +"建设值：" + ass.facility[i].buildNum + "\n" + "建筑状态：" + (ass.facility[i].status==0 ? "未启用":"启用"));
        }
        await ForwardMsg(e, msg);
    }
}


/**
 * 地点查询
 */
async function GoBlessPlace(e, weizhi, addres) {
    let adr = addres;
    let msg = [
        "***" + adr + "***"
    ];
    for (let i = 0; i < weizhi.length; i++) {
        msg.push(weizhi[i].name + "\n" + "等级：" + weizhi[i].level + "\n"  + "修炼效率：" + weizhi[i].efficiency * 100 + "%");
    }
    await ForwardMsg(e, msg);
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

async function getFightMember(members,position) {
    let res = [];
    for(let i=0;i<members.length;i++){
        const action = await Read_action(members[i]);
        if(action.x >= position.x1
            && action.x <= position.x2
            && action.y >= position.y1
            && action.y <= position.y2){
            res.push(members[i]);
        }
    }
    return res;
}


async function SealingFormation(members) {
    let res = {
        "nowblood": 0,
        "attack": 0,
        "defense": 0,
        "blood": 999999999,
        "burst": 0,
        "burstmax": 50,
        "speed": 0,
        "power": 0
    };
    for(let i=0;i<members.length;i++){
        const battle = await Read_battle(members[i]);
        res.nowblood += battle.nowblood;
        res.attack += battle.attack;
        res.defense += battle.defense;
        res.speed += battle.speed;
        res.burst += 5;
        res.burstmax +=10;
    }
    return res;
}

async function AssBattle(e,battleA,battleB) {
    let msg = [];
    let qq = 1;
    if (battleA.speed >= battleB.speed) {
        let hurt = battleA.attack - battleB.defense >= 0 ? battleA.attack - battleB.defense + 1 : 1;

        if (await battle_probability(battleA.burst)) {
            hurt = Math.floor(hurt * battleA.burstmax / 100);
        };
        battleB.nowblood = battleB.nowblood - hurt;
        if (battleB.nowblood < 1) {
            e.reply('你们结成的阵法过于强大，只一招就攻破了对面的山门！');
            return qq;
        } else {
            msg.push('你们催动法力，造成' + hurt + '伤害');
        };
    }
    //循环回合，默认从B攻击开始
    var x = 1;
    var y = 0;
    var z = 1;
    while (true) {
        x++;
        z++;
        //分片发送消息
        if (x == 15) {
            await ForwardMsg(e, msg);
            msg = [];
            x = 0;
            y++;
            if (y == 2) {
                qq = battleA.nowblood > battleB.nowblood ? 1:0;
                //就打2轮回
                break;
            };
        };
        //B开始
        let hurt = battleB.attack - battleA.defense >= 0 ? battleB.attack - battleA.defense + 1 : 1;
        if (await battle_probability(battleB.burst)) {
            hurt = Math.floor(hurt * battleB.burstmax / 100);
        };
        battleA.nowblood = battleA.nowblood - hurt;
        if (battleA.nowblood < 0) {
            msg.push('第' + z + '回合:对方依靠大阵回击，造成' + hurt + '伤害');
            await ForwardMsg(e, msg);
            e.reply('你们的进攻被击退了！！');
            qq = 0;
            break;
        } else {
            msg.push('第' + z + '回合:对方依靠大阵回击，造成' + hurt + '伤害');
        };
        //A开始
        hurt = battleA.attack - battleB.defense >= 0 ? battleA.attack - battleB.defense + 1 : 1;
        if (await battle_probability(battleA.burst)) {
            hurt = Math.floor(hurt * battleA.burstmax /100);
        };
        battleB.nowblood = battleB.nowblood - hurt;
        if (battleB.nowblood < 0) {
            msg.push('第' + z + '回合:你们结阵攻伐，造成' + hurt + '伤害');
            await ForwardMsg(e, msg);
            e.reply('你们击破了对面的山门！');
            break;
        } else {
            msg.push('第' + z + '回合:你们结阵攻伐，造成' + hurt + '伤害');
        };
    };
    return qq;
}

//暴击率
export const battle_probability = async (P) => {
    let newp = 0;
    if (P > 100) {
        newp = 100;
    };
    if (P < 0) {
        newp = 0;
    };
    const rand = Math.floor((Math.random() * (100 - 1) + 1));
    if (newp > rand) {
        return true;
    };
    return false;
};

async function AddPrestige(members) {
    for(let i=0;i<members.length;i++){
        const userLevel=await Read_level(members[i]);
        userLevel.prestige +=2;
        await Write_level(members[i], userLevel);
    }
}
