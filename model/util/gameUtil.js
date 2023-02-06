/**-----------------------------------------------
 description: 
    一些游戏工具
 -----------------------------------------------**/

import { forceNumber } from "./math.js";

/******* 
 * @description: 比较两个物品id, 作为sort升序排列方法
 * @param {string} _id1 id1
 * @param {string} _id2 id2
 * @return {number} -1, 0, 1
 */
export function compareByIdAsc(_id1, _id2) {
    const id1 = _id1.split('-');
    const id2 = _id2.split('-');
    const cnt = Math.min(id1.length, id2.length);
    for (let i = 0; i < cnt; ++i) {
        if (id1[i] == id2[i]) continue;
        return forceNumber(id1[i]) - forceNumber(id2[i]);
    }
    return 0;
}

/******* 
 * @description: 解析消息并返回被at的uid（qq）, at多人只返回第一个at的uid
 * @param {*} _e plugin参数e
 * @return {number} uid号，解析失败返回undefined
 */
export function getAtUid(_e) {
    const elem = _e.message.filter(msg => msg.type === 'at');
    if (elem.length <= 0) return undefined;
    return elem[0].qq;
}

/**
 * @description: 发送转发消息合集
 * @param {*} _e plugin参数e
 * @param {[]} _msg 消息数组
 * @return 无返回值
 */
export async function replyForwardMsg(_e, _msg, limit = 2) {
    //转发消息过短直接单条消息换行输出
    if(_msg.length <= limit){
        e.reply(_msg.join('\n'));
        return;
    }

    const msg = [];
    _msg.forEach(m => msg.push({
        user_id: Bot.uin,
        nickname: Bot.nickname,
        message: m,
    }));

    let count = 0, done = false, rpl = undefined;
    while (count < 10 && !done) {
        try {
            count++;
            rpl = await Bot.makeForwardMsg(msg);
            done = true;
        } catch (error) {
            if (error.code == 192) {
                logger.warn(`获取转发消息失败, 准备第${count + 1}次尝试.`);
                continue;
            }

            logger.error(error);
            break;
        }
    }

    _e.reply(rpl == undefined ? '获取转发消息失败！' : rpl);
}


/**
 * @description: 删除玩家所有修仙cd以及状态
 * @param {string} _uid 玩家id
 * @return 无返回值
 */
export async function delRedisKeys(_uid) {
    const keys = await redis.keys(`xiuxian*${_uid}*`);
    keys.forEach(key => redis.del(key));
}

/**
 * @description: 获取qq信息 有.nickname
 * @param {number} _uid 玩家id
 * @return {Promise<*>} 返回msg
 */
export async function getQQInfo(_uid) {
    return await Bot.getStrangerInfo(_uid);
}