import data from '../../System/data.js';
import { GetInfo, SetInfo } from './InfoCache.js';
import { forceNumber } from '../../mathCommon.js';

const redisKey = "xiuxian:player:lifeInfo";
const PATH = data.__gameDataPath.life;

/******* 
 * @description: 从cache里获取玩家的生涯信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetLifeInfo(_uid) {
    return await GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
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
 * @description: 获取玩家道号
 * @param {string} _uid 玩家id
 * @return {Promise<string>} 玩家道号， 获取失败返回undefined
 */
export async function GetName(_uid) {
    const lifeInfo = await GetLifeInfo(_uid);
    return lifeInfo?.name;
}

/******* 
 * @description: 获取玩家道宣
 * @param {string} _uid 玩家id
 * @return {Promise<string>} 玩家道宣， 获取失败返回undefined
 */
export async function GetAutograph(_uid) {
    const lifeInfo = await GetLifeInfo(_uid);
    return lifeInfo?.autograph;
}

/******* 
 * @description: 修改玩家道号
 * @param {string} _uid 玩家id
 * @param {string} _name 新道号
 * @return 无返回值
 */
export async function SetName(_uid, _name) {
    const lifeInfo = await GetLifeInfo(_uid);
    if (lifeInfo == undefined) return;

    lifeInfo.name = _name;
    SetLifeInfo(_uid, lifeInfo);
}

/******* 
 * @description: 获取玩家道宣
 * @param {string} _uid 玩家id
 * @param {string} _autograph 新道宣
 * @return 无返回值
 */
export async function SetAutograph(_uid, _autograph) {
    const lifeInfo = await GetLifeInfo(_uid);
    if (lifeInfo == undefined) return;

    lifeInfo.autograph = _autograph;
    SetLifeInfo(_uid, lifeInfo);
}


/******* 
 * @description: 增加玩家年龄
 * @param {string} _uid 玩家id
 * @param {number} _count 增加的量
 * @return 无返回值
 */
export async function AddAge(_uid, _count) {
    const lifeInfo = await GetLifeInfo(_uid);
    if (lifeInfo == undefined) return;

    lifeInfo.age += forceNumber(_count);
    if (lifeInfo.age >= lifeInfo.life)
        lifeInfo.status = 0;
    SetLifeInfo(_uid, lifeInfo);
}

/******* 
 * @description: 增加玩家寿命
 * @param {string} _uid 玩家id
 * @param {number} _count 增加的量
 * @return 无返回值
 */
export async function AddLife(_uid, _count) {
    const lifeInfo = await GetLifeInfo(_uid);
    if (lifeInfo == undefined) return;

    lifeInfo.life += forceNumber(_count);
    SetLifeInfo(_uid, lifeInfo);
}