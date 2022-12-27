import { __PATH } from '../../../apps/Xiuxian/Xiuxian.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:equipmentInfo";
const PATH = __PATH.equipment;

/******* 
 * @description: 从cache里获取玩家的装备信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetEquipmentInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家装备信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _equipmentInfo 玩家装备信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetEquipmentInfo(_uid, _equipmentInfo) {
    SetInfo(_uid, _equipmentInfo, redisKey, `${PATH}/${_uid}.json`);
}