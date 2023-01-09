import data from '../../System/data.js';
import { ReadSync } from '../../File/File.js';

const redisKey = 'xiuxian:areas';

/** ***** 
 * @description: 从cache里所有区域信息, 若没有则读文件, 读文件失败返回undefined
 * @return {Promise<JSON>} 返回的对应信息 JSON对象 区域信息数组
 */
export async function GetAllArea() {
    let value = await redis.get(redisKey);
    if (value == null) {
        value = ReadSync(data.__gameDataPath.allArea);
        if (value == undefined) return undefined;

        redis.set(redisKey, value);
    }
    return JSON.parse(value);
}



