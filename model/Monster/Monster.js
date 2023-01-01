import Data from "../XiuxianData.js";

const MonsterName = ['蜥', '狮', '鹏', '雕', '雀', '豹', '虎', '龟', '猫', '龙','鲲','鸡','蛇','狼','鼠','鹿','貂','猴','狗','熊','羊','牛','象','兔','猪'];
const MonsterLevelName = ['小兵','兵', '将', '兽', '魔', '妖', '大妖', '王', '皇', '帝', '神'];


//怪物的基类，储存怪物name, level, battleInfo信息
export class Monster{
    /**
     * @description: 根据等级生成一个怪物
     * @param {Number} _level 怪物等级
     */    
    constructor(_level){
        //TODO:本来多少要报个warning， log没搞好，先这么搞着吧
        _level = clamp(_level, 1, MonsterLevelName.length);

        this.name = MonsterName[Math.floor(Math.random() * MonsterName.length)] + MonsterLevelName[_level - 1];
        this.level = _level;

        //TODO:我认为这个怪物应该有一套单独的面板机制= =， 还没想好, 暂定练气炼体各半取随机相加
        const tmpInfo0 = Data.levelList[_level - 1];
        const tmpInfo1 = Data.bodyLevelList[_level - 1];
        const percent0 = Math.random() * 0.5 + 0.5;
        const percent1 = Math.random() * 0.7 + 0.7;
        this.battleInfo = {
            "nowblood": Math.floor(tmpInfo0.blood * percent0 + tmpInfo1.blood * percent1),
            "attack": Math.floor(tmpInfo0.attack * percent0 + tmpInfo1.attack * percent1),
            "defense": Math.floor(tmpInfo0.defense * percent0 + tmpInfo1.defense * percent1),
            "blood": Math.floor(tmpInfo0.blood * percent0 + tmpInfo1.blood * percent1),
            "burst": Math.floor(tmpInfo0.burst * percent0 + tmpInfo1.burst * percent1),
            "burstmax": Math.floor(tmpInfo0.burstmax * percent0 + tmpInfo1.burstmax * percent1),
            "speed": Math.floor(tmpInfo0.speed * percent0 + tmpInfo1.speed * percent1),
        }
    }
}


function clamp(value, min, max){
    return Math.min(max, Math.max(value, min));
}