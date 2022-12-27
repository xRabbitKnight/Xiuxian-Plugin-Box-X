import { __PATH } from '../../../apps/Xiuxian/Xiuxian.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:warehouseInfo";
const PATH = __PATH.warehouse;

/******* 
 * @description: 从cache里获取玩家的仓库信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetWarehouseInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家仓库信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _warehouseInfo 玩家仓库信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetWarehouseInfo(_uid, _warehouseInfo) {
    SetInfo(_uid, _warehouseInfo, redisKey, `${PATH}/${_uid}.json`);
}