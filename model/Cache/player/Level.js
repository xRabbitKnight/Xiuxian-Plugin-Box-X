import data from '../../System/data.js';
import path from 'path';
import { lock } from '../base.js';
import { forceNumber } from '../../util/math.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = data.__gameDataKey.level;
const PATH = data.__gameDataPath.level;


//#region Get方法

/******* 
 * @description: 获取玩家的等级信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 返回的LevelInfo JSON对象
 */
export async function GetLevel(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getLevelInfo(_uid);
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 设置玩家等级信息, 注意该方法会覆盖更新玩家等级信息, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _levelInfo 等级信息
 * @return 无返回值
 */
export async function SetLevel(_uid, _levelInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setLevelInfo(_uid, _levelInfo);
    });
}

/******* 
 * @description: 增加修为
 * @param {number} _uid 玩家id
 * @param {number} _count 增加的修为量
 * @return 无返回值
 */
export async function AddExp(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const levelInfo = await getLevelInfo(_uid);
        if (levelInfo == undefined) return;

        levelInfo.exp += forceNumber(_count);
        await setLevelInfo(_uid, levelInfo);
    });
}

/******* 
 * @description: 增加气血
 * @param {number} _uid 玩家id
 * @param {number} _count 增加的气血的量
 * @return 无返回值
 */
export async function AddBodyExp(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const levelInfo = await getLevelInfo(_uid);
        if (levelInfo == undefined) return;

        levelInfo.bodyExp += forceNumber(_count);
        await setLevelInfo(_uid, levelInfo);
    });
}

//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的等级信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 等级信息
 */
export async function getLevelInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家等级信息, 并写入数据
 * @param {number} _uid 玩家id
 * @param {any} _levelInfo 等级信息
 * @return 无返回值
 */
export async function setLevelInfo(_uid, _levelInfo) {
    await SetInfo(_uid, _levelInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

//#endregion



