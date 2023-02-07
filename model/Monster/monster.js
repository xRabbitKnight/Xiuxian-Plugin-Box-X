import data from "../System/data.js";
import { clamp, forceNumber, rand, randItem } from '../util'

const MonsterName = ['蜥', '狮', '鹏', '雕', '雀', '豹', '虎', '龟', '猫', '龙', '鲲', '鸡', '蛇', '狼', '鼠', '鹿', '貂', '猴', '狗', '熊', '羊', '牛', '象', '兔', '猪'];
const MonsterLevelName = ['小兵', '兵', '将', '兽', '魔', '妖', '大妖', '王', '皇', '帝', '神'];

/******* 
 * @description: 怪物的基类
 */
export default class Monster {
    /******* 
     * @param {number} level：怪物等级，选填，不填随机生成
     * @param {string} name：怪物名，选填，不填将随机生成
     * @param {*} battleInfo: 战斗相关信息，选填，不填将随机生成
     * @param {string} dropTip: 掉落标签，选填，不填默认normal
     * @param {Function} addEvent: 添加时事件，选填, 不填默认undefined
     * @param {Function} delEvent: 删除时事件，选填, 不填默认undefined
     */
    constructor(data) {
        /** 怪物等级 */
        this.level = data.level != undefined ?
            clamp(forceNumber(data.level), 1, MonsterLevelName.length) :
            rand(1, MonsterLevelName.length + 1);
        /** 怪物名 */
        this.name = data.name || randItem(MonsterName) + MonsterLevelName[this.level - 1];
        /** 怪物战斗面板信息 */
        this.battleInfo = data.battleInfo || generateMonsterBattleInfo(this.level);
        /** 怪物掉落标签 */
        this.dropTip = data.dropTip || 'normal';
        /** 怪物添加时事件 */
        this.addEvent = data.addEvent || undefined;
        /** 怪物删除时事件 */
        this.delEvent = data.delEvent || undefined;
    }
}

function generateMonsterBattleInfo(_level) {
    const tmpInfo0 = data.levelList[_level - 1];
    const tmpInfo1 = data.bodyLevelList[_level - 1];
    const percent0 = Math.random() * 0.5 + 0.5;
    const percent1 = Math.random() * 0.7 + 0.7;

    return {
        nowblood: Math.floor(tmpInfo0.blood * percent0 + tmpInfo1.blood * percent1),
        attack: Math.floor(tmpInfo0.attack * percent0 + tmpInfo1.attack * percent1),
        defense: Math.floor(tmpInfo0.defense * percent0 + tmpInfo1.defense * percent1),
        blood: Math.floor(tmpInfo0.blood * percent0 + tmpInfo1.blood * percent1),
        burst: Math.floor(tmpInfo0.burst * percent0 + tmpInfo1.burst * percent1),
        burstmax: Math.floor(tmpInfo0.burstmax * percent0 + tmpInfo1.burstmax * percent1),
        speed: Math.floor(tmpInfo0.speed * percent0 + tmpInfo1.speed * percent1),
    }
}