import { __PATH } from '../../../apps/Xiuxian/Xiuxian.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:battleInfo";
const PATH = __PATH.battle;

/******* 
 * @description: 从cache里获取玩家的战斗面板信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetBattleInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家战斗面板信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _battleInfo 玩家面板信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetBattleInfo(_uid, _battleInfo) {
    SetInfo(_uid, _battleInfo, redisKey, `${PATH}/${_uid}.json`);
}

/*******
 * @description: 获取玩家移动速度
 * @param {string} _uid 玩家id
 * @return {Promise<number>} 返回移动速度，获取失败时返回undefined
 */
export async function GetSpeed(_uid){
    const battleInfo = await GetBattleInfo(_uid);
    return battleInfo?.speed;
}