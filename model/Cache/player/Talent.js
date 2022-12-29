import { __PATH } from '../../../apps/Xiuxian/Xiuxian.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:talentInfo";
const PATH = __PATH.talent;

/******* 
 * @description: 从cache里获取玩家的灵根信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetTalentInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家灵根信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _talentInfo 玩家灵根信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetTalentInfo(_uid, _talentInfo) {
    SetInfo(_uid, _talentInfo, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 从cache里获取玩家的修炼天赋加成信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<number>} 返回的BattleInfo JSON对象
 */
export async function GetTalentBuff(_uid){
    const talentInfo = await GetTalentInfo(_uid);
    return talentInfo?.talentsize;
}