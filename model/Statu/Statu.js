import { GetBattleInfo } from "../Cache/player/Battle.js";
import { GetLifeInfo } from "../Cache/player/Life.js";

/******* 
 * @description: 检查有无此人存档
 */
const existPlayer = async (_e) => {
    const life = await GetLifeInfo(_e.user_id);
    if (life == undefined) {
        _e.reply("生死簿上查无此人，请先#降临世界！");
        return false;
    };

    if (life.status == 0) {
        _e.reply("你此生寿元已尽，请#再入仙途！");
        return false;
    };

    return true;
}

/******* 
 * @description: 检查是否群中消息
 */
const isGroup = async (_e) => {
    if (!_e.isGroup) {
        _e.reply("该指令必须在多人群中进行！");
        return false;
    }
    return true;
}

/******* 
 * @description: 检查是否在某行动中
 */
const action = async (_e) => {
    const action = await redis.get(`xiuxian:player:${_e.user_id}:action`);
    if (action != undefined) {
        _e.reply(JSON.parse(action).actionName + '中...');
        return false;
    };
    return true;
}

/******* 
 * @description: 检查是否在赶路中
 */
const moving = async (_e) => {
    const action = await redis.get(`xiuxian:player:${_e.user_id}:moving`);
    if (action != undefined) {
        _e.reply(action + '中...');
        return false;
    };
    return true;
}

/******* 
 * @description: 检查血量是否充足
 */
const blood = async (_e) => {
    if ((await GetBattleInfo(_e.user_id)).nowblood <= 1) {
        _e.reply("血量不足......");
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
    "exist": [existPlayer],
    "inGroup": [isGroup],
    "inAction": [existPlayer, isGroup, action],
    "isMoving": [existPlayer, isGroup, action],
    "canBattle": [existPlayer, isGroup, action, blood],
    "canMove": [existPlayer, isGroup, action, blood],
    "canGive": [existPlayer, isGroup, action, blood],
    "canLevelUp": [existPlayer, isGroup, action, blood],
}

/******* 
 * @description: 根据状态标签，逐级检查是否可继续进行，内部回复状态封锁原因
 * @param {*} _e plugin参数e
 * @param {number} _statuLevel 状态标签，见上方StatuLevel
 * @return {Promise<boolean>} 返回状态 false->不可进行 
 */
export async function CheckStatu(_e, _statuLevel) {
    let res = true;
    for (let i = 0; i <= _statuLevel.length && res; ++i) {
        res &= (await _statuLevel[i](_e));
    }
    return res;
}