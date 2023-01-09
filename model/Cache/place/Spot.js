import data from '../../System/data.js';
import { ReadSync } from '../../File/File.js';
import { GetActionInfo } from '../player/Action.js';

const redisKey = 'xiuxian:spots';

/** ***** 
 * @description: 从cache里所有地点坐标信息, 若没有则读文件, 读文件失败返回undefined
 * @return {Promise<JSON>} 返回的对应信息 JSON对象 坐标信息数组
 */
export async function GetAllSpot() {
    let value = await redis.get(redisKey);
    if (value == null) {
        value = ReadSync(data.__gameDataPath.allSpot);
        if (value == undefined) return undefined;

        redis.set(redisKey, value);
    }
    return JSON.parse(value);
}

/******* 
 * @description: 检查玩家是否在某个地点
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {string} _spotName 地点名，可以是一部分名称
 * @return {Promise<bool>} 返回玩家是否在地点
 */
export async function IfAtSpot(_uid, _spotName) {
    const player = await GetActionInfo(_uid);
    const spots = await GetAllSpot();
    if (player == undefined || spots == undefined) return false;

    const ret = spots.find(spot => spot.x == player.x && spot.y == player.y && spot.name.includes(_spotName));
    return ret != undefined;
}
