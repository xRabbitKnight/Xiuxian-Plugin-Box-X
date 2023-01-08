import data from '../../System/data.js';
import { ReadSync, WriteAsync } from '../../File/File.js';

const filePath = data.__gameDataPath.players;
const redisKey = 'xiuxian:players';

/** ***** 
 * @description: 从cache里所有玩家uid, 若没有则读文件, 读文件失败返回undefine
 * @return {Promise<JSON>} 返回的对应信息 JSON对象 玩家uid数组
 */
 export async function GetAllUid() {
    let value = await redis.get(redisKey);
    if (value == null) {
        value = ReadSync(filePath);
        if(value == undefined) return undefined;

        redis.set(redisKey, value);
    }
    return JSON.parse(value);
}

/******* 
 * @description: 新增玩家uid, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return 无返回值
 */
export async function AddUid(_uid) {
    const players = GetAllUid();
    players.push(_uid);

    const info = JSON.stringify(players);
    redis.set(redisKey, info);
    WriteAsync(filePath, info);
}