/******* 
 * @description: 
 *  管理所有怪物，主游戏所有怪物在Init初始化
 *  插件中新增怪物请在插件GameInit中调用AddMonster()加入
 */

import { RefreshMonster } from "./refresh.js";

/** 储存所有怪物 key: regionId, value: Monster[] */
const monsters = {}

export default class MonsterMgr {

    /******* 
     * @description: 初始化怪物管理器
     * @return 无返回值
     */
    static Init() {
        //补全所有地区怪物
        RefreshMonster();
    }

    /******* 
     * @description: 将怪物添加至对应地区
     * @param {number} _region 待添加的地区号
     * @param {Monster} _monster 怪物实例
     */
    static AddMonster(_region, _monster) {
        if (!monsters[_region]) monsters[_region] = [];

        _monster.region = _region;
        monsters[_region].push(_monster);

        if (_monster.addEvent) _monster.addEvent();
    }

    /******* 
     * @description: 删除某个怪物
     * @param {Monster} _monster 怪物实例
     */
    static DeleteMonster(_monster) {
        if (!monsters[_monster.region])
            return;

        const pos = monsters[_monster.region].indexOf(_monster);
        if (pos != -1) monsters[_monster.region].splice(pos, 1);

        if (_monster.delEvent) _monster.delEvent();
    }

    /******* 
     * @description: 返回目标地区所有怪物
     * @param {number} _region 目标地区号
     * @return {Monster[]} 目标地区所有怪物
     */
    static GetMonsters(_region) {
        if (!monsters[_region]) monsters[_region] = [];
        return monsters[_region];
    }

    /******* 
     * @description: 返回目标地区的怪物数量
     * @param {number} _region 目标地区号 
     * @return {number} 对应怪物数量
     */
    static GetMonsterCount(_region) {
        if (!monsters[_region]) monsters[_region] = [];
        return monsters[_region].length;
    }
}