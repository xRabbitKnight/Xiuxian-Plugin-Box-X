import Data from "../XiuxianData.js";
import { Read_battle, Write_battle } from "../../apps/Xiuxian/Xiuxian.js";
import { Model_1v1 } from "./BattleModel_1v1.js";

/**
 * @description: PVE 1v1战斗
 * @param {Object} _user 攻击者信息（发送消息的人）
 * @param {Object} _monsterInfo 目标怪物信息
 * @param {[]} _msg 待发送消息集合
 * @return {bool} 战斗结果，win->true
 */
export async function PVE(_user, _monsterInfo, _msg){
    //1. 获取1v1战斗模型
    const battleModel = Model_1v1;

    //2. 准备参数, 开始战斗
    const attacker = {
        'name' : _user.sender.nickname,
        'battleInfo' : await Read_battle(_user.user_id)
    }
    const target = {
        'name' : _monsterInfo.name,
        'battleInfo' : await getMonsterBattleInfo(_monsterInfo)
    }
    const battleResult = battleModel(attacker, target, _msg);

    //3. 战斗结束，处理结果
    Write_battle(_user.user_id, attacker.battleInfo);
    return battleResult;
}

/**
 * @description: 获取怪物的战斗面板 
 * @param {Object} _monsterInfo 怪物信息
 * @return {battleInfo} 怪物战斗面板
 */
async function getMonsterBattleInfo(_monsterInfo){
    const info = Data.LevelMax_list.find(item => item.id == _monsterInfo.level);
    return {
        'nowblood': info.blood,
        ...info
    };
}