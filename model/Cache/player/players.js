import data from '../../System/data.js';
import { lock } from '../../util';
import { ReadSync } from '../../File/File.js';

const filePath = data.__gameDataPath.players;
const redisKey = data.__gameDataKey.players;

/** ***** 
 * @description: 获取所有玩家uid
 * @return {Promise<[]>} 返回的所有玩家uid数组 获取失败返回undefined
 */
export async function GetAllUid() {
    return await lock(`${redisKey}`, async () => {
        let value = await redis.get(redisKey);
        if (value == null) {
            value = ReadSync(filePath);
            if (value == undefined) return undefined;

            await redis.set(redisKey, value);
        }
        return JSON.parse(value);
    });
}

/******* 
 * @description: 新增玩家uid, 并写入数据
 * @param {number} _uid 玩家id
 * @return 无返回值
 */
export async function AddUid(_uid) {
    lock(`${redisKey}`, async () => {
        const players = await GetAllUid();
        if (players.indexOf(_uid) == -1) players.push(_uid);

        await redis.set(redisKey, JSON.stringify(players));
    });
}