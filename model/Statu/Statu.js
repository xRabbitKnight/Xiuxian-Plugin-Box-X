import { GetBattleInfo } from "../Cache/player/Battle.js";
import { GetStatus } from "../Cache/player/Life.js";
import { GetAllUid } from "../Cache/player/players.js";

/******* 
 * @description: 检查有无此人存档
 */
async function existPlayer(_e, _reply) {
    const isExist = (await GetAllUid()).find(uid => uid == _e.user_id);
    
    if (isExist == undefined) {
        if (_reply) _e.reply("生死簿上查无此人，请先#降临世界！");
        return false;
    }

    if (!await GetStatus(_e.user_id)) {
        if (_reply) _e.reply("你此生寿元已尽，请#再入仙途！");
        return false;
    }

    return true;
}

/******* 
 * @description: 检查是否群中消息
 */
async function isGroup(_e, _reply) {
    if (!_e.isGroup) {
        if (_reply) _e.reply("该指令必须在多人群中进行！");
        return false;
    }
    return true;
}

/******* 
 * @description: 检查是否在某行动中
 */
async function action(_e, _reply) {
    const action = await redis.get(`xiuxian:player:${_e.user_id}:action`);
    if (action != undefined) {
        if (_reply) _e.reply(JSON.parse(action).actionName + '中...');
        return false;
    }
    return true;
}

/******* 
 * @description: 检查是否在赶路中
 */
async function moving(_e, _reply) {
    const action = await redis.get(`xiuxian:player:${_e.user_id}:moving`);
    if (action != undefined) {
        if (_reply) _e.reply(action + '中...');
        return false;
    }
    return true;
}

/******* 
 * @description: 检查血量是否充足
 */
async function blood(_e, _reply) {
    if ((await GetBattleInfo(_e.user_id)).nowblood <= 1) {
        if (_reply) _e.reply("血量不足......");
        return false;
    }
    return true;
}

/******* 
 * @description: 需检测内容,为检测该状态等级的func
 *  方法传入plugin的传参e，方法内reply封锁原因，并返回检测结果
 */
const checkList = [
    existPlayer,
    isGroup,
    action,
    moving,
    blood,
];

/******* 
 * @description: 状态标签
 */
export const StatuLevel = {
    exist: [existPlayer],
    inGroup: [isGroup],
    existAndInGroup: [existPlayer, isGroup],
    inAction: [existPlayer, isGroup, action],
    isMoving: [existPlayer, isGroup, action],
    canBattle: [existPlayer, isGroup, action, blood],
    canMove: [existPlayer, isGroup, action, blood],
    canGive: [existPlayer, isGroup, action, blood],
    canLevelUp: [existPlayer, isGroup, action, blood],
}

/******* 
 * @description: 根据状态标签，逐级检查是否可继续进行
 * @param {*} _e plugin参数e
 * @param {number} _level 状态标签，见上方StatuLevel
 * @param {bool} _reply 是否主动回复状态封锁原因，默认为true
 * @return {Promise<boolean>} 返回状态 false->不可进行 
 */
export async function CheckStatu(_e, _level, _reply = true) {
    let res = true;
    for (let i = 0; i < _level.length && res; ++i) {
        res &= (await _level[i](_e, _reply));
    }
    return res;
}