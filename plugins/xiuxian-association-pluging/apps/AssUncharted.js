import plugin from '../../../../../lib/plugins/plugin.js'
import fs from "node:fs"
import data from '../../../model/XiuxianData.js'
import assUtil from '../model/AssUtil.js'
import config from "../../../model/Config.js"
import {
    Add_najie_thing,
    ForwardMsg,search_thing_id,Add_experiencemax,
    Go, monsterbattle,Read_battle,Read_action,
    Read_najie, Write_najie, isNotNull, Read_wealth,Write_wealth
} from "../../../apps/Xiuxian/Xiuxian.js";


//要DIY的话，确保这两个数组长度相等

/**
 * 宗门
 */

export class AssUncharted extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'AssUncharted',
            /** 功能描述 */
            dsc: '宗门模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: '^#宗门秘境列表$',
                    fnc: 'List_AssUncharted'
                },
                {
                    reg: '^#探索宗门秘境.*$',
                    fnc: 'Go_Guild_Secrets'
                },
                {
                    reg: '^#秘境移动向.*$',
                    fnc: 'Labyrinth_Move'
                },
                {
                    reg: '^#宗门秘境更名.*$',
                    fnc: 'Rename_AssUncharted'
                },
                {
                    reg: '^#查看秘境收获$',
                    fnc: 'Show_Uncharted_Gain'
                },
                {
                    reg: '^#开启宝箱$',
                    fnc: 'Open_The_Chest'
                },
                {
                    reg: '^#逃离秘境$',
                    fnc: 'Escape_Uncharted'
                }
            ]
        })
        this.xiuxianConfigData = config.getConfig("xiuxian", "xiuxian");
    }

    async List_AssUncharted(e){

        const usr_qq = e.user_id;
        //无存档
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        const addres="宗门秘境";
        let weizhi = [];


        let assList = [];
        let files = fs
            .readdirSync("./plugins/Xiuxian-Plugin-Box/plugins/xiuxian-association-pluging/resources/Association/AssItem")
            .filter((file) => file.endsWith(".json"));
        for (let file of files) {
            file = file.replace(".json", "");
            assList.push(file);
        }

        for (let assId of assList) {
            const assUncharted = await assUtil.getAssOrPlayer(2,assId);
            weizhi.push(assUncharted);
        }
        await GoAssUncharted(e, weizhi, addres);
    }

    async Go_Guild_Secrets(e) {
        const go =await Go(e);
        if (!go) {
            return;
        }
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay) {
            return;
        }
        let didian = await e.msg.replace("#探索宗门秘境", '');
        didian = didian.trim();
        const weizhi = await assUtil.assRelationList.find(item => item.unchartedName == didian);
        if(!isNotNull(weizhi)){
            return ;
        }
        //秘境所属宗门
        let ass = await assUtil.getAssOrPlayer(2,weizhi.id);
        if(ass.facility[2].status == 0){
            e.reply(`该秘境暂未开放使用！`);
            return ;
        }

        const position = JSON.parse(fs.readFileSync(`${assUtil.position}/position.json`)).find(item => item.name == ass.resident.name);
        const action = await Read_action(usr_qq);
        if(action.x < position.x1
            || action.x > position.x2
            || action.y < position.y1
            || action.y > position.y2){
            e.reply(`请先到达此宗门势力范围内`);
            return ;
        }

        //初始化 秘境等级，奖励等级，迷宫地图，秘境游玩临时存档

        //秘境等级，驻地等级 -- 驻地+宗门
        // 1 - 11
        const unchartedLevel =  ass.resident.level + Math.trunc(Math.random() * ass.level);
        //奖励等级
        let incentivesLevel;
        if(unchartedLevel <= 3){
            incentivesLevel = 2;
        }else {
            // 2 - 12
            incentivesLevel = unchartedLevel + Math.trunc(Math.random() * 4) -2;
        }
        //扣钱
        const player = await Read_wealth(usr_qq);
        e.reply(`本次生成秘境等级为${unchartedLevel},奖励等级为${incentivesLevel}`);
        if(player.lingshi < unchartedLevel * 5000){
            e.reply(`没钱，买不起秘境门票`);
            return ;
        }
        if(ass.spiritStoneAns < incentivesLevel * 5000 ){
            e.reply(`这个宗门的灵石池，无法支撑秘境的运转了！`);
            return ;
        }
        const assPlayer = assUtil.getAssOrPlayer(1,usr_qq);

        if(assPlayer.assName == ass.id){
            player.lingshi -= unchartedLevel * 4500;
        }else {
            player.lingshi -= unchartedLevel * 5000;
        }
        ass.spiritStoneAns -= incentivesLevel *5000;

        await assUtil.setAssOrPlayer("association",ass.id,ass);
        await Write_wealth(usr_qq,player);

        //完事了，该进秘境了
        //初始化临时存档，选择随机地图，添加状态
        const now_time = new Date().getTime();
        const actionObject = {
            'actionName': '宗门秘境',
            'startTime': now_time
        };
        await redis.set(`xiuxian:player:${usr_qq}:action`, JSON.stringify(actionObject));

        const number = Math.trunc(Math.random() * 5);
        const interimArchive = {
            "assResident" : ass.resident.id,
            "unchartedLevel" : unchartedLevel,
            "incentivesLevel" : incentivesLevel,
            "labyrinthMap" : number,
            "abscissa":1,
            "ordinate":1,
            "alreadyExplore" : [],
            "treasureChests" : []
        };
        await assUtil.setAssOrPlayer("interimArchive",usr_qq,interimArchive);
        ass.facility[2].buildNum -=1;
        await assUtil.checkFacility(ass);
        e.reply(`你已成功进入${didian}秘境,开始探索吧！`);
        return;
    }


    async Labyrinth_Move(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup || !assUtil.existAss("interimArchive",usr_qq)) {
            return;
        }
        const player = await Read_battle(usr_qq);
        if (player.nowblood <= 1) {
            e.reply('血量不足...');
            return false;
        };
        let direction = await e.msg.replace("#秘境移动向", '');
        direction = direction.trim();
        const interimArchive = assUtil.getAssOrPlayer(3,usr_qq);
        let abscissa = interimArchive.abscissa;
        let ordinate = interimArchive.ordinate;
        switch (true) {
            case (direction=="上"):
                ordinate += 1;
                break;
            case (direction=="下"):
                ordinate -= 1;
                break;
            case (direction=="左"):
                abscissa -= 1;
                break;
            case (direction=="右"):
                abscissa += 1;
                break;
            default:
                direction = 0;
                break;
        }
        if(direction == 0){
            return ;
        }

        const labyrinthMap = await assUtil.assLabyrinthList[interimArchive.labyrinthMap];
        const newPoint = labyrinthMap.find(item => item.x == abscissa && item.y == ordinate);
        if(!isNotNull(newPoint) || !newPoint.transit){
            e.reply(`此路不通！！！`);
            return ;
        }


        const CDTime = 1;
        const ClassCD = ":LabyrinthMove";
        const now_time = new Date().getTime();
        const cdSecond =await redis.ttl("xiuxian:player:" + usr_qq + ClassCD);
        if(cdSecond!= -2){
            e.reply(`休整一下再出发吧，剩余${cdSecond}秒！`);
            return ;
        }

        await redis.set("xiuxian:player:" + usr_qq + ClassCD ,now_time);
        await redis.expire("xiuxian:player:" + usr_qq + ClassCD , CDTime * 60);


        //随机事件
        let random = Math.random();
        const everCame = interimArchive.alreadyExplore.find(item => item.x == abscissa && item.y == ordinate);
        if(isNotNull(everCame)){
           random = 0.1;
        }else {
            interimArchive.alreadyExplore.push({
                "x":abscissa,
                "y":ordinate
            });
        }

        //位置变更
        interimArchive.abscissa = abscissa;
        interimArchive.ordinate = ordinate;


        if(random < 0.55){
            e.reply(`无事发生`);
        }else if(random < 0.85){
            //遇怪
            const battle = await Read_battle(usr_qq);
            let levelId;
            let buff = 1;
            if(interimArchive.unchartedLevel < 3){
                // 1 2 级秘境，刷怪，2.3  和 3.4
                levelId = interimArchive.unchartedLevel + 1 + Math.trunc(Math.random()*2);
            }else if(interimArchive.unchartedLevel < 8){
                // 3 4 5 6 7级秘境 刷怪  3.4.5  4.5.6  5.6.7
                levelId = interimArchive.unchartedLevel + 1 + Math.trunc(Math.random()*3);
            }else{
                // 8 9 10 11
                levelId = 8 + Math.trunc(Math.random()*2);
                buff = Math.trunc(Math.random()*(interimArchive.unchartedLevel - 7))+10;
                buff = (buff/10).toFixed(2);
            }

            const LevelMax = data.Level_list.find(item => item.id == levelId);

            const monsters = {
                'nowblood': Math.floor(LevelMax.blood*buff) ,
                'attack': Math.floor(LevelMax.attack*buff) ,
                'defense': Math.floor(LevelMax.defense*buff) ,
                'blood': Math.floor(LevelMax.blood*buff) ,
                'burst': LevelMax.burst + LevelMax.id * 5 ,
                'burstmax': LevelMax.burstmax + LevelMax.id * 10 ,
                'speed': LevelMax.speed + 5
            };
            const battle_msg = await monsterbattle(e, battle, monsters);
            let msg = [
                "——[不巧遇见了怪物]——"
            ];
            battle_msg.msg.forEach((item)=>{
                msg.push(item);
            });


            await Add_experiencemax(usr_qq, 50*interimArchive.incentivesLevel);
            msg.push(`获得了${50*interimArchive.incentivesLevel}气血`);
            await ForwardMsg(e, msg);

        }else {
            //宝箱
            const chestsType = Math.ceil(Math.random()*5);
            let chestsLevel;
            if(interimArchive.incentivesLevel <= 6){
                chestsLevel = interimArchive.incentivesLevel + Math.trunc(Math.random() * 3) -1;
            }else {
                chestsLevel = interimArchive.incentivesLevel + Math.trunc(Math.random() * 5) -2;
            }

            const chests ={
                "type": chestsType,
                "level": chestsLevel
            };
            e.reply(`获得了一个宝箱，可使用#查看秘境收获，进行查看`);
            interimArchive.treasureChests.push(chests);
        }

        await assUtil.setAssOrPlayer("interimArchive",usr_qq,interimArchive);
        return ;
    }

    async Rename_AssUncharted(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }
        let assPlayer = assUtil.getAssOrPlayer(1,usr_qq);
        if(assPlayer.assName == 0 || assPlayer.assJob < 8 ){
            return;
        }
        let ass = assUtil.getAssOrPlayer(2,assPlayer.assName);
        if(ass.facility[2].status == 0){
            e.reply(`宗门秘境未建设好！`);
            return ;
        }

        let newName = e.msg.replace("#宗门秘境更名", '');
        newName = newName.trim();
        const reg = /[^\u4e00-\u9fa5]/g;//汉字检验正则
        const res = reg.test(newName);
        //res为true表示存在汉字以外的字符
        if (res) {
            await this.reply('宗门秘境名只能使用中文，请重新输入！');
            return;
        }
        const weizhi = await assUtil.assRelationList.find(item => item.unchartedName == newName);
        if(isNotNull(weizhi)){
            e.reply(`秘境不允许重名`);
            return ;
        }
        await assUtil.assRename(assPlayer.assName,2,newName);
        e.reply(`宗门秘境已成功更名为${newName}`);
        return ;
    }

    async Show_Uncharted_Gain(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        if(!assUtil.existAss("interimArchive",usr_qq)){
            return ;
        }
        const interimArchive = assUtil.getAssOrPlayer(3,usr_qq);

        let msg = [
            `__[秘境收获]__`
        ];

        if(interimArchive.treasureChests.length <= 0){
            msg.push("空空如也！！！");
        }else {
            for(let i=0;i<interimArchive.treasureChests.length;i++){
                const name = await getThingType(interimArchive.treasureChests[i].type);
                msg.push(`${interimArchive.treasureChests[i].level}级${name}宝箱`);
            }
        }
        await ForwardMsg(e,msg);
        return ;
    }


    async Open_The_Chest(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        if(!assUtil.existAss("interimArchive",usr_qq)){
            return ;
        }
        const interimArchive = assUtil.getAssOrPlayer(3,usr_qq);
        let msg = [
            `__[开启结果]__`
        ];

        if(interimArchive.treasureChests.length <= 0){
            msg.push("没宝箱开锤子呢");
        }else {
            for(let i=0;i<interimArchive.treasureChests.length;i++){
                let lastNum;
                if(interimArchive.incentivesLevel <= 6){
                   lastNum = interimArchive.treasureChests[i].level + Math.trunc(Math.random()*4);
                }else {
                    lastNum = interimArchive.treasureChests[i].level + Math.trunc(Math.random()*6)-2;
                }
                let thingId = interimArchive.treasureChests[i].type+"-1-"+lastNum;
                if(interimArchive.treasureChests[i].type == 4 && lastNum >=10){
                    thingId = interimArchive.treasureChests[i].type+"-2-"+lastNum;
                }
                let addThing =await search_thing_id(thingId);
                if(addThing == 1){
                    addThing =await search_thing_id("6-1-2");
                }
                await Add_najie_things(addThing, usr_qq, 1);
                msg.push(`你获得了${addThing.name}`);
            }
        }
        interimArchive.treasureChests = [];
        await assUtil.setAssOrPlayer("interimArchive",usr_qq,interimArchive);
        await ForwardMsg(e,msg);
        return ;
    }

    async Escape_Uncharted(e){
        const usr_qq = e.user_id;
        const ifexistplay = await assUtil.existArchive(usr_qq);
        if (!ifexistplay || !e.isGroup) {
            return;
        }

        if(assUtil.existAss("interimArchive",usr_qq)){
            const interimArchive = assUtil.getAssOrPlayer(3,usr_qq);
            if(interimArchive.alreadyExplore.length > 11){
                const idList=["1-1-40","2-1-40"];
                const randomSource = Math.random();
                const probability = interimArchive.incentivesLevel * 0.03;

                if(randomSource< probability){
                    //获得特殊产出
                    const find = assUtil.blessPlaceList.find(item => item.id == interimArchive.assResident);
                    const location = Math.trunc(Math.random() * find.specialty.length);
                    let addThing =await search_thing_id(find.specialty[location]);
                    if(addThing == 1){
                        addThing =await search_thing_id("6-1-2");
                    }
                    await Add_najie_things(addThing, usr_qq, 1);
                   e.reply(`你获得了${addThing.name}`);
                }else {
                    const location = Math.trunc(Math.random() * idList.length);
                    let addThing =await search_thing_id(idList[location]);
                    if(addThing == 1){
                        addThing =await search_thing_id("6-1-2");
                    }
                    await Add_najie_things(addThing, usr_qq, 1);
                    e.reply(`你获得了${addThing.name}`);
                }

            }

            fs.rmSync(`${assUtil.interimArchive}/${usr_qq}.json`);
        }
        let action = await redis.get(`xiuxian:player:${usr_qq}:action`);
        if (action == undefined) {
            return;
        };
        action = JSON.parse(action);
        if (action.actionName != '宗门秘境') {
            return;
        };
        await redis.del('xiuxian:player:' + usr_qq + ':action');
        e.reply(`已成功脱离秘境`);
        return ;
    }

}


/**
 * 地点查询
 */
async function GoAssUncharted(e, weizhi, addres) {
    let adr = addres;
    let msg = [
        "***" + adr + "***"
    ];
    for (let i = 0; i < weizhi.length; i++) {
        const find = assUtil.assRelationList.find(item => item.id ==  weizhi[i].id);
        const status =weizhi[i].facility[2].status==0?"未建成":"已启用";
        msg.push(find.unchartedName + "\n" + "归属宗门：" + find.name + "\n" + "状态：" + status + "\n" +"地点：" + weizhi[i].resident.name);
    }
    await ForwardMsg(e, msg);
}



async function Add_najie_things(thing ,user_qq, account) {
    let najie = await Read_najie(user_qq);
    najie = await Add_najie_thing(najie,thing,account);
    await Write_najie(user_qq,najie);
    return ;
}

async function getThingType(type) {
    let name;
    switch (type) {
        case 1:
            name = "武器";
            break;
        case 2:
            name = "防具";
            break;
        case 3:
            name = "法宝";
            break;
        case 4:
            name = "丹药";
            break;
        case 5:
            name = "功法";
            break;
        default:
            name = "随机";
            break;
    }
    return name;
}


