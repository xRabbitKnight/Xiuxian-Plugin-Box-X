import MonsterMgr from "../Region/MonsterMgr.js";
import { _1v1 } from "./BattleModel_1v1.js";
import { GetBattleInfo, SetBattleInfo } from "../Cache/player/Battle.js";

/**
 * @description: PVE 1v1战斗
 * @param {Object} _e 攻击者信息（发送消息的人, plugin参数e）
 * @param {Monster} _monster 目标怪物信息
 * @param {[]} _msg 待发送消息集合
 * @return {bool} 战斗结果，win->true
 */
export async function PVE(_e, _monster, _msg){
    //1. 获取1v1战斗模型
    const battleModel = _1v1;

    //2. 开始战斗
    const attacker = {
        'name' : _e.sender.nickname,
        'battleInfo' : await GetBattleInfo(_e.user_id)
    }
    const battleResult = battleModel(attacker, _monster, _msg);

    //3. 战斗结束，处理结果
    SetBattleInfo(_e.user_id, attacker.battleInfo);
    if(battleResult) MonsterMgr.DeleteMonster(_monster);
    
    return battleResult;
}