import { GetNowBlood } from "../Cache/player/Battle.js";
import { GetStatus } from "../Cache/player/Life.js";
import { GetAllUid } from "../Cache/player/players.js";

/******* 
 * @description: 检查有无此人存档
 */
async function exist(_e, _reply) {
    const isExist = (await GetAllUid()).find(uid => uid == _e.user_id);

    if (isExist == undefined) {
        if (_reply) _e.reply("生死簿上查无此人，请先#降临世界！");
        return false;
    }
    return true;
}

/******* 
 * @description: 检查此人是否存活
 */
async function isAlive(_e, _reply) {
    if (!await GetStatus(_e.user_id)) {
        if (_reply) _e.reply("你此生寿元已尽，请#再入仙途！");
        return false;
    }
    return true;
}

/******* 
 * @description: 检查是否群中消息
 */
async function inGroup(_e, _reply) {
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
    if ((await GetNowBlood(_e.user_id)) <= 1) {
        if (_reply) _e.reply("血量不足......");
        return false;
    }
    return true;
}

const fnc = [null, exist, isAlive, inGroup, action, moving, blood];

const content = {
    /** 检查存档是否存在 */
    exist: 0b1,
    /** 检查玩家存活状态 */
    isAlive: 0b10,
    /** 检查消息是否来源于群组 */
    inGroup: 0b100,
    /** 检查玩家是否处于行动中 */
    action: 0b1000,
    /** 检查玩家是否处于移动中 */
    moving: 0b10000,
    /** 检查玩家是否血量充足 */
    blood: 0b100000,
}

/******* 
 * @description: 状态标签
 */
export const StatuLevel = {
    //独立标签

    /** 检查存档是否存在 */
    exist: content.exist,
    /** 检查玩家存活状态 */
    isAlive: content.isAlive,
    /** 检查消息是否来源于群组 */
    inGroup: content.inGroup,
    /** 检查玩家是否处于行动中 */
    action: content.action,
    /** 检查玩家是否处于移动中 */
    moving: content.moving,
    /** 检查玩家是否血量充足 */
    blood: content.blood,

    //组合标签

    /**  检查存档+存活状态*/
    alive: content.exist | content.isAlive,
    /**  检查存档+是否群组发言*/
    aliveAndInGroup: content.exist | content.inGroup,
    /**  检查是否行动中*/
    inAction: content.exist | content.isAlive | content.inGroup | content.action,
    /**  检查是否移动中*/
    isMoving: content.exist | content.isAlive | content.inGroup | content.action | content.moving,
    /**  检查是否可战斗*/
    canBattle: content.exist | content.isAlive |  content.action | content.moving | content.blood,
    /**  检查是否可移动*/
    canMove: content.exist | content.isAlive | content.inGroup | content.action | content.moving | content.blood,
    /**  检查是否可赠与*/
    canGive: content.exist | content.isAlive | content.inGroup | content.action | content.moving | content.blood,
    /**  检查是否可升级*/
    canLevelUp: content.exist | content.isAlive | content.action | content.moving | content.blood,
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
    for (let i = 1, pos = 1; i <= _level && res; i <<= 1, pos++) {
        if ((_level & i) == 0) continue;
        res &= (await fnc[pos](_e, _reply));
    }
    return res;
}