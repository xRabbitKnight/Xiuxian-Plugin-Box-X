
/******* 
 * @description: 按key设置cd
 * @param {string} _redisKey 需要设置cd的key
 * @param {number} _minute 时间，单位为分钟
 * @return 无返回值
 */
export async function AddCD(_redisKey, _minute) {
    try {
        redis.setEx(_redisKey, _minute * 60, `${new Date().getTime()}`);
    } catch (error) {
        logger.info(`设置cd:${_redisKey} ${_minute}失败.\n ${error}`);
        return;
    }
}
/******* 
 * @description: 按key删除cd
 * @param {string} _redisKey 需要删除cd的key
 * @return 无返回值
 */
export async function DelCD(_redisKey) {
    try {
        redis.del(_redisKey);
    } catch (error) {
        logger.info(`删除cd:${_redisKey}失败.\n ${error}`);
        return;
    }
}

/******* 
 * @description: 查询cd剩余时间
 * @param {string} _redisKey 待查询的cd
 * @return {Promise<number>} cd剩余时间 <0为冷却好了
 */
export async function GetCD(_redisKey) {
    return await redis.ttl(_redisKey);
}