import fs from "node:fs"
import path from "path"
import data from '../../../model/XiuxianData.js'
import { existplayerplugins,player_efficiency,existplayer } from "../../../apps/Xiuxian/Xiuxian.js";

/*
  数据封装
 */
class AssUtil {
    constructor() {
        //插件根目录
        const __dirname = path.resolve() + path.sep + "plugins" + path.sep + "Xiuxian-Plugin-Box/plugins/xiuxian-association-pluging"
        const allDirName = path.resolve() + path.sep + "plugins" + path.sep + "Xiuxian-Plugin-Box"
        //修仙配置
        this.filePathMap = {
            //宗门数据
            "association": path.join(__dirname, "/resources/Association/AssItem"),
            //用户的宗门数据
            "assPlayer": path.join(__dirname, "/resources/Association/AssPlayer"),
            "assRelation": path.join(__dirname, "/resources/Association/AssRelation"),
            "assTreasureVault": path.join(__dirname, "/resources/Association/AssTreasureVault"),
            "interimArchive": path.join(__dirname, "/resources/Association/interimArchive"),
            "assRelate": path.join(__dirname, "/resources/AssRelate"),
            "all": path.join(allDirName, "/resources/data/birth/all"),
            'position': path.join(allDirName, '/resources/data/birth/position')

        }

        //装备
        this.assPlayer = this.filePathMap.assPlayer;
        //物品
        this.association = this.filePathMap.association;
        this.assRelation = this.filePathMap.assRelation;
        this.assTreasureVault = this.filePathMap.assTreasureVault;
        this.interimArchive = this.filePathMap.interimArchive;
        this.assRelate = this.filePathMap.assRelate;
        this.all = this.filePathMap.all;
        this.position = this.filePathMap.position;
        this.blessPlaceList = JSON.parse(fs.readFileSync(`${this.assRelate}/BlessPlace.json`));
        this.baseTreasureVaultList = JSON.parse(fs.readFileSync(`${this.assRelate}/BaseTreasureVault.json`));
        this.assLabyrinthList = JSON.parse(fs.readFileSync(`${this.assRelate}/AssLabyrinth.json`));
        this.assRelationList = JSON.parse(fs.readFileSync(`${this.assRelation}/AssRelation.json`));


        data.addlist([
            ...JSON.parse(fs.readFileSync(`${this.all}/all.json`)),
            ...JSON.parse(fs.readFileSync(`${this.assRelate}/AllAssProducts.json`))
        ], 'all');
        data.addlist([
            ...JSON.parse(fs.readFileSync(`${this.all}/dropsItem.json`)),
            ...JSON.parse(fs.readFileSync(`${this.assRelate}/AllAssProducts.json`)).slice(0,2),
            ...JSON.parse(fs.readFileSync(`${this.assRelate}/AllAssProducts.json`)).slice(0,2),
        ], 'dropsItem');
        data.addposition([
            ...JSON.parse(fs.readFileSync(`${this.position}/point.json`)),
            ...JSON.parse(fs.readFileSync(`${this.assRelate}/AssPoint.json`))
        ], 'point');
        data.addposition([
            ...JSON.parse(fs.readFileSync(`${this.position}/position.json`)),
            ...JSON.parse(fs.readFileSync(`${this.assRelate}/AssPosition.json`))
        ], 'position');
    }


    /**
     * 检测宗门存档或用户宗门信息是否存在
     * @param file_path_type ["assPlayer" , "association" ]
     * @param file_name
     */
    existAss(file_path_type, file_name) {
        let file_path;
        file_path = this.filePathMap[file_path_type];
        let dir = path.join(file_path + '/' + file_name + '.json');
        if (fs.existsSync(dir)) {
            return true;
        }
        return false;
    }



    /**
     * 获取用户宗门信息或宗门存档
     * @param assName
     * @param user_qq
     */
    getAssOrPlayer(type,name) {
        let file_path;
        let dir;
        let data;
        if (type == 1) {
            file_path = this.filePathMap["assPlayer"];
            dir = path.join(file_path + '/' + name + '.json');
        } else if(type == 2){
            file_path = this.filePathMap["association"];
            dir = path.join(file_path + '/' + name + '.json');
        }else if (type == 3){
            file_path = this.filePathMap["interimArchive"];
            dir = path.join(file_path + '/' + name + '.json');
        }else {
            file_path = this.filePathMap["assTreasureVault"];
            dir = path.join(file_path + '/' + name + '.json');
        }

        try {
            data = fs.readFileSync(dir, 'utf8')
        }
        catch (error) {
            logger.error('读取文件错误：' + error);
            return "error";
        }
        //将字符串数据转变成json格式
        data = JSON.parse(data);
        return data;
    }


    /**
     * 写入数据
     * @param file_name  ["assPlayer" , "association" ]
     * @param itemName
     * @param data
     */
    setAssOrPlayer(file_name, itemName, data) {
        let file_path;
        let dir;

        file_path = this.filePathMap[file_name];
        dir = path.join(file_path + '/' + itemName + '.json');

        let new_ARR = JSON.stringify(data, "", "\t");//json转string
        fs.writeFileSync(dir, new_ARR, 'utf-8', (err) => {
            console.log('写入成功', err)
        })
        return;
    }

    assEffCount(assPlayer){
        let effective=0;
        if(assPlayer.assName == 0){
            assPlayer.effective=effective;
            this.setAssOrPlayer("assPlayer",assPlayer.qqNumber,assPlayer);
            return;
        }
        let ass = this.getAssOrPlayer(2,assPlayer.assName);

        if(ass.resident.id!=0){
            effective+=ass.resident.efficiency;
        }
        if(ass.facility[4].status!=0){
            effective+=ass.level * 0.05;
            effective+=ass.level * ass.resident.level * 0.01;
        }


        let coefficient = 0;
        let jobList=["master","elder","innerDisciple","outDisciple","miscellaneousLabor"];
        let location = jobList.findIndex( item=> item == assPlayer.assJob);
        switch (location) {
            case 0:
                coefficient=1.5;
                break;
            case 1:
                coefficient=1.3;
                break;
            case 2:
                coefficient=1.1;
                break;
            case 3:
                coefficient=0.9;
                break;
            case 4:
                coefficient=0.7;
                break;
            default:
                coefficient=0.1;
                break;
        }

        effective=effective*coefficient;
        assPlayer.effective=effective.toFixed(2);
        this.setAssOrPlayer("assPlayer",assPlayer.qqNumber,assPlayer);
        return ;
    }

    async assRename(ass, type, association_name) {
        let assRelation = this.assRelationList;
        const find = assRelation.find(item => item.id == ass);
        const location = assRelation.findIndex(item => item.id == ass);
        if(type == 1){
            find.name = association_name;
        }else {
            find.unchartedName = association_name;
        }
        assRelation.splice(location,1,find);
        let file_path = this.assRelation;
        let dir;

        dir = path.join(file_path + '/AssRelation.json');

        let new_ARR = JSON.stringify(assRelation, "", "\t");//json转string
        fs.writeFileSync(dir, new_ARR, 'utf-8', (err) => {
            console.log('写入成功', err)
        })
        return;

    }


    async checkFacility(ass){
        let oldStatus = ass.facility[4].status ;
        const buildNumList=[100,500,500,200,200,200,300];
        for(let i=0;i<ass.facility.length;i++){
            if(ass.facility[i].buildNum > buildNumList[i]){
                ass.facility[i].status=1;
            }else {
                ass.facility[i].status=0;
            }
        }
        await this.setAssOrPlayer("association",ass.id,ass);
        if(oldStatus != ass.facility[4].status){
            const playerList = ass.allMembers;
            for (let player_id of playerList) {
                const usr_qq = player_id;
                if(this.existAss("assPlayer",usr_qq)){
                    const assOrPlayer = this.getAssOrPlayer(1,usr_qq);
                    this.assEffCount(assOrPlayer);
                }
            }
        }
        return ;
    }

    async existArchive(qq){
        let isexist = await existplayer(qq);
        // 不存在
        if(!isexist){
            return false;
        }
        let player = await existplayerplugins(qq);
        // 修仙存在此人，看宗门系统有没有他
        if(!this.existAss("assPlayer",qq)){
            return false;
        }
        let assPlayer = await this.getAssOrPlayer(1,qq);
        //只有命数一样，且生命状态正常才为true
        if( player.createTime == assPlayer.xiuxianTime && player.status == 1){
            return true;
        }
        //两边有存档，但是死了，需要执行插件删档
        //先退宗，再重置
        if(this.existAss("association",assPlayer.assName)){
            let ass = this.getAssOrPlayer(2,assPlayer.assName);

            if (assPlayer.assJob < 10) {
                ass.job[assPlayer.assJob] = ass.job[assPlayer.assJob].filter( item => item != assPlayer.qqNumber);//原来的职位表删掉这个B
                ass.allMembers = ass.allMembers.filter( item => item != assPlayer.qqNumber);//原来的职位表删掉这个B
                await this.setAssOrPlayer("association",ass.id, ass);//记录到存档
            } else {
                if (ass.allMembers.length < 2) {
                    fs.rmSync(`${this.filePathMap.association}/${assPlayer.assName}.json`);
                } else {
                    ass.allMembers = ass.allMembers.filter( item => item != assPlayer.qqNumber);
                    //给宗主
                    let randMember_qq = 0;
                    if (ass.job.elder.length > 0) { randMember_qq = await get_random_fromARR(ass.job.elder); }
                    else if (ass.job.innerDisciple.length > 0) { randMember_qq = await get_random_fromARR(ass.job.innerDisciple); }
                    else if (ass.job.outDisciple.length > 0) { randMember_qq = await get_random_fromARR(ass.job.outDisciple); }
                    else { randMember_qq = await get_random_fromARR(ass.allMembers); }

                    let randMember = await this.getAssOrPlayer(1, randMember_qq);//获取幸运儿的存档
                    ass.job[randMember.assJob] = ass.job[randMember.assJob].filter(item => item != randMember_qq);
                    ass.master= randMember_qq;//新的职位表加入这个幸运儿
                    randMember.assJob = "master";//成员存档里改职位

                    await this.setAssOrPlayer("association",ass.id, ass);//记录到存档
                    await this.assEffCount(randMember);
                    await player_efficiency(randMember_qq);
                }
            }
        }
        assPlayer = {
            "assName": 0,
            "qqNumber": qq+"",
            "assJob": 0,
            "effective": 0,
            "contributionPoints": 0,
            "historyContribution": 0,
            "favorability": 0,
            "volunteerAss": 0,
            "lastSignAss":0,
            "lastExplorTime":0,
            "lastBounsTime":0,
            "xiuxianTime":player.createTime,
            "time": []
        };

        await this.setAssOrPlayer("assPlayer",qq,assPlayer);
        return false;
    }

}

async function get_random_fromARR(ARR) {
    let randindex = Math.trunc(Math.random() * ARR.length);
    return ARR[randindex];
}

export default new AssUtil();
