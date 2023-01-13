import data from '../../System/data.js';
import { lock } from '../base.js';
import { forceNumber } from '../../mathCommon.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:levelInfo";
const PATH = data.__gameDataPath.level;

/******* 
 * @description: 从cache里获取玩家的等级信息, 若没有则读文件, 读文件失败返回undefine
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的LevelInfo JSON对象
 */
export async function GetLevelInfo(_uid) {
    return await GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家等级信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _levelInfo 玩家面板信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetLevelInfo(_uid, _levelInfo) {
    await SetInfo(_uid, _levelInfo, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 增加修为
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {number} _count 增加的修为的量
 * @return 无返回值
 */
export async function AddExp(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const levelInfo = await GetLevelInfo(_uid);
        if (levelInfo == undefined) return;

        levelInfo.exp += forceNumber(_count);
        await SetLevelInfo(_uid, levelInfo);
    });
}

/******* 
 * @description: 增加气血
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {number} _count 增加的修为的量
 * @return 无返回值
 */
export async function AddBodyExp(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const levelInfo = await GetLevelInfo(_uid);
        if (levelInfo == undefined) return;

        levelInfo.bodyExp += forceNumber(_count);
        await SetLevelInfo(_uid, levelInfo);
    });
}