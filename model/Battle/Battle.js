import MonsterMgr from "../Region/MonsterMgr.js";
import * as util from '../util/gameUtil.js';
import { _1v1 as pve } from "./PVE.js";
import { _1v1 as pvp } from './PVP.js';
import { GetBattleInfo, SetNowblood } from "../Cache/player/Battle.js";

/**
 * @description: PVE 1v1战斗
 * @param {Object} _e 攻击者信息（发送消息的人, plugin参数e）
 * @param {Monster} _monster 目标怪物信息
 * @param {[]} _msg 待发送消息集合
 * @return {Promise<bool>} 战斗结果，win->true
 */
export async function PVE(_e, _monster, _msg) {
    //1. 获取1v1战斗模型s
    const battleModel = pve;

    //2. 开始战斗
    const attacker = {
        uid: _e.user_id,
        name: _e.sender.nickname,
        battleInfo: await GetBattleInfo(_e.user_id)
    }
    const battleResult = await battleModel(attacker, _monster, _msg);

    //3. 战斗结束，处理结果
    SetNowblood(_e.user_id, attacker.battleInfo.nowblood);
    if (battleResult) MonsterMgr.DeleteMonster(_monster);

    return battleResult;
}

/**
 * @description: PVE 1v1战斗
 * @param {Object} _e 攻击者信息（发送消息的人, plugin参数e）
 * @param {Monster} _targetId 目标信息
 * @param {[]} _msg 待发送消息集合
 * @return {bool} 战斗结果，win->true
 */
export async function PVP(_e, _targetId, _msg) {
    //1. 获取1v1战斗模型
    const battleModel = pvp;

    //2. 开始战斗
    const attacker = {
        uid: _e.user_id,
        name: _e.sender.nickname,
        battleInfo: await GetBattleInfo(_e.user_id)
    }
    const target = {
        uid: _targetId,
        name: (await util.getQQInfo(Number(_targetId))).nickname,
        battleInfo: await GetBattleInfo(_targetId)
    }
    const battleResult = await battleModel(attacker, target, _msg);

    //3. 战斗结束，处理结果
    SetNowblood(_e.user_id, attacker.battleInfo.nowblood);
    SetNowblood(_targetId, target.battleInfo.nowblood);

    return battleResult;
}