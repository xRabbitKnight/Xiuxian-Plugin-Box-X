import data from '../../System/data.js';
import { lock } from '../base.js';
import { ReadSync } from '../../File/File.js';

const filePath = data.__gameDataPath.players;
const redisKey = data.__gameDataKey.players;

/** ***** 
 * @description: 从cache里所有玩家uid, 若没有则读文件, 读文件失败返回undefine
 * @return {Promise<JSON>} 返回的对应信息 JSON对象 玩家uid数组
 */
export async function GetAllUid() {
    let value = await redis.get(redisKey);
    if (value == null) {
        value = ReadSync(filePath);
        if (value == undefined) return undefined;

        await redis.set(redisKey, value);
    }
    return JSON.parse(value);
}

/******* 
 * @description: 新增玩家uid, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return 无返回值
 */
export async function AddUid(_uid) {
    lock(`${redisKey}`, async () => {
        const players = await GetAllUid();
        if (players.indexOf(_uid) == -1) players.push(_uid);

        await redis.set(redisKey, JSON.stringify(players));
    });
}