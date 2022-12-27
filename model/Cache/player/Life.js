import { __PATH } from '../../../apps/Xiuxian/Xiuxian.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:lifeInfo";
const PATH = __PATH.life;

/******* 
 * @description: 从cache里获取玩家的生涯信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetLifeInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家生涯信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _lifeInfo 玩家生涯信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetLifeInfo(_uid, _lifeInfo) {
    SetInfo(_uid, _lifeInfo, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 根据玩家id获取道号
 * @param {string} _uid 玩家id
 * @return {Promise<string>} 玩家道号， 获取失败返回undefined
 */
export async function GetName(_uid){
    const lifeInfo = await GetLifeInfo(_uid);
    return lifeInfo?.name;
}

/******* 
 * @description: 增加玩家年龄
 * @param {string} _uid 玩家id
 * @param {number} _count 增加的量
 * @return 无返回值
 */
export async function AddAge(_uid, _count){
    const lifeInfo = await GetLifeInfo(_uid);
    if (lifeInfo == undefined) return;

    lifeInfo.age += forceNumber(_count);
    if(lifeInfo.age >= lifeInfo.life) 
        lifeInfo.status = 0;
    SetLevelInfo(_uid, lifeInfo);
}