import { __PATH } from '../../apps/Xiuxian/Xiuxian.js';
import { forceNumber } from '../mathCommon.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:LevelInfo";
const PATH = __PATH.level;

/******* 
 * @description: 从cache里获取玩家的等级信息, 若没有则读文件, 读文件失败返回undefine
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的LevelInfo JSON对象
 */
export async function GetLevelInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家等级信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _levelInfo 玩家面板信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetLevelInfo(_uid, _levelInfo) {
    SetInfo(_uid, _levelInfo, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 增加修为
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {number} _count 增加的修为的量
 * @return 无返回值
 */
export async function AddExp(_uid, _count) {
    const levelInfo = await GetLevelInfo(_uid);
    if (levelInfo == undefined) return;
    levelInfo.experience += forceNumber(_count);
    SetLevelInfo(_uid, levelInfo);
}

/******* 
 * @description: 增加气血
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {number} _count 增加的修为的量
 * @return 无返回值
 */
export async function AddExpMax(_uid, _count) {
    const levelInfo = await GetLevelInfo(_uid);
    if (levelInfo == undefined) return;
    levelInfo.experiencemax += forceNumber(_count);
    SetLevelInfo(_uid, levelInfo);
}