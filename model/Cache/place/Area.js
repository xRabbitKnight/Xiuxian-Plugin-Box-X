import data from '../../System/data.js';
import { ReadSync } from '../../File/File.js';
import { rand } from '../../util/math.js';

const redisKey = 'xiuxian:areas';

/** ***** 
 * @description: 获取所有区域信息
 * @return {Promise<[]>} 所有区域信息，失败返回undefined
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

/******* 
 * @description: 获取一个随机区域
 * @return {Promise<any>} 区域对象 获取失败返回undefined
 */
export async function GetRandArea() {
    const areas = await GetAllArea();
    if (areas == undefined) return undefined;

    return areas[rand(0, areas.length)];
}


/******* 
 * @description: 获取区域名
 * @param {string} _areaId 区域id
 * @return {Promise<string>} 区域名 获取失败返回undefined
 */
export async function GetAreaName(_areaId) {
    const areas = await GetAllArea();
    if (areas == undefined) return undefined;

    return areas.find(item => item.id.split('-')[1] == _areaId)?.name;
}

