import { ReadSync } from '../../File/File.js';

/** ***** 
 * @description: 从cache里获取玩家的信息, 若没有则读文件, 读文件失败返回undefined
 * @param {number} _uid 玩家id, plugin参数e.user_id
 * @param {string} _redisKey cache 中 key
 * @param {string} _filePath 读文件时路径
 * @return {Promise<JSON>} 返回的对应信息 JSON对象
 */
export async function GetInfo(_uid, _redisKey, _filePath) {
    let value = await redis.hGet(_redisKey, `${_uid}`);
    if (value == null) {
        value = ReadSync(_filePath);
        if (value == undefined) return undefined;

        await redis.hSet(_redisKey, `${_uid}`, value);
    }
    return JSON.parse(value);
}

/******* 
 * @description: 更新玩家信息, 并写入数据
 * @param {number} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _info 玩家信息, 注意是JSON对象
 * @param {string} _redisKey cache 中 key
 * @return 无返回值
 */
export async function SetInfo(_uid, _info, _redisKey) {
    await redis.hSet(_redisKey, `${_uid}`, JSON.stringify(_info));
}