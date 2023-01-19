import data from '../../System/data.js';
import path from 'path';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = data.__gameDataKey.action;
const PATH = data.__gameDataPath.action;

/******* 
 * @description: 从cache里获取玩家的行为信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的ActionInfo JSON对象
 */
export async function GetActionInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家行为信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _actionInfo 玩家面板信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetActionInfo(_uid, _actionInfo) {
    await SetInfo(_uid, _actionInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 获取玩家所在区域
 * @param {string} _uid 玩家id
 * @return {Promise<number>} 区域编号，获取失败返回undefined
 */
export async function GetPlayerRegion(_uid) {
    const actionInfo = await GetActionInfo(_uid);
    return actionInfo?.region;
}