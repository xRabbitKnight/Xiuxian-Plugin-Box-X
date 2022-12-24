import MonsterMgr from "../Region/MonsterMgr.js";
import { Read_battle, Write_battle } from "../../apps/Xiuxian/Xiuxian.js";
import { Model_1v1 } from "./BattleModel_1v1.js";

/**
 * @description: PVE 1v1战斗
 * @param {Object} _e 攻击者信息（发送消息的人, plugin参数e）
 * @param {Monster} _monster 目标怪物信息
 * @param {[]} _msg 待发送消息集合
 * @return {bool} 战斗结果，win->true
 */
export async function PVE(_e, _monster, _msg){
    //1. 获取1v1战斗模型
    const battleModel = Model_1v1;

    //2. 开始战斗
    const attacker = {
        'name' : _e.sender.nickname,
        'battleInfo' : await Read_battle(_e.user_id)
    }
    const battleResult = await battleModel(attacker, _monster, _msg);

    //3. 战斗结束，处理结果
    await Write_battle(_e.user_id, attacker.battleInfo);
    if(battleResult) MonsterMgr.DeleteMonster(_monster);
    
    return battleResult;
}