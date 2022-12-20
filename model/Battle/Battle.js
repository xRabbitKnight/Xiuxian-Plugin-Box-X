import Data from "../XiuxianData.js";
import { Read_battle, Write_battle } from "../../apps/Xiuxian/Xiuxian.js";
import { Model_1v1 } from "./BattleModel_1v1.js";

/**
 * @description: PVE 1v1战斗
 * @param {Object} _user 攻击者信息（发送消息的人）
 * @param {Monster} _monster 目标怪物信息
 * @param {[]} _msg 待发送消息集合
 * @return {bool} 战斗结果，win->true
 */
export async function PVE(_user, _monster, _msg){
    //1. 获取1v1战斗模型
    const battleModel = Model_1v1;

    //2. 准备参数, 开始战斗
    const attacker = {
        'name' : _user.sender.nickname,
        'battleInfo' : await Read_battle(_user.user_id)
    }
    const battleResult = battleModel(attacker, _monster, _msg);

    //3. 战斗结束，处理结果
    Write_battle(_user.user_id, attacker.battleInfo);
    if(battleResult) MonsterMgr.DeleteMonster(_monster);
    
    return battleResult;
}