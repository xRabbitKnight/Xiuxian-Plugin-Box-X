import data from '../../System/data.js';
import path from 'path';
import { GetInfo, SetInfo } from './InfoCache.js';
import { forceNumber, lock } from '../../util';

const redisKey = data.__gameDataKey.life;
const PATH = data.__gameDataPath.life;

//#region Get方法

/******* 
 * @description: 获取玩家的生涯信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 生涯信息
 */
export async function GetLife(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getLifeInfo(_uid);
    });
}

/******* 
 * @description: 获取玩家道号
 * @param {number} _uid 玩家id
 * @return {Promise<string>} 玩家道号， 获取失败返回undefined
 */
export async function GetName(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const lifeInfo = await getLifeInfo(_uid);
        return lifeInfo?.name;
    });
}

/******* 
 * @description: 获取玩家道宣
 * @param {number} _uid 玩家id
 * @return {Promise<string>} 玩家道宣， 获取失败返回undefined
 */
export async function GetAutograph(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const lifeInfo = await getLifeInfo(_uid);
        return lifeInfo?.autograph;
    });
}

/**
 * @description: 获取玩家存活状态
 * @param {number} _uid 玩家id
 * @return {Promise<bool>} true -> 活
 */
export async function GetStatus(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const lifeInfo = await getLifeInfo(_uid);
        return lifeInfo?.status;
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 更新玩家生涯信息, 注意该方法会覆盖更新玩家生涯信息, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _lifeInfo 玩家生涯信息
 * @return 无返回值
 */
export async function SetLife(_uid, _lifeInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setLifeInfo(_uid, _lifeInfo);
    });
}
/******* 
 * @description: 设置玩家道号
 * @param {number} _uid 玩家id
 * @param {string} _name 新道号
 * @return 无返回值
 */
export async function SetName(_uid, _name) {
    lock(`${redisKey}:${_uid}`, async () => {
        const lifeInfo = await getLifeInfo(_uid);
        if (lifeInfo == undefined) return;

        lifeInfo.name = _name;
        await setLifeInfo(_uid, lifeInfo);
    });
}

/******* 
 * @description: 设置玩家道宣
 * @param {number} _uid 玩家id
 * @param {string} _autograph 新道宣
 * @return 无返回值
 */
export async function SetAutograph(_uid, _autograph) {
    lock(`${redisKey}:${_uid}`, async () => {
        const lifeInfo = await getLifeInfo(_uid);
        if (lifeInfo == undefined) return;

        lifeInfo.autograph = _autograph;
        await setLifeInfo(_uid, lifeInfo);
    });
}


/******* 
 * @description: 增加玩家年龄，超过寿命设置死亡
 * @param {number} _uid 玩家id
 * @param {number} _count 增加的量
 * @return 无返回值
 */
export async function AddAge(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const lifeInfo = await getLifeInfo(_uid);
        if (lifeInfo == undefined) return;

        lifeInfo.age += forceNumber(_count);
        if (lifeInfo.age >= lifeInfo.life)
            lifeInfo.status = 0;
        await setLifeInfo(_uid, lifeInfo);
    });
}

/******* 
 * @description: 增加玩家寿命
 * @param {number} _uid 玩家id
 * @param {number} _count 增加的量
 * @return 无返回值
 */
export async function AddLife(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const lifeInfo = await getLifeInfo(_uid);
        if (lifeInfo == undefined) return;

        lifeInfo.lifetime += forceNumber(_count);
        await setLifeInfo(_uid, lifeInfo);
    });
}

//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的生涯信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 生涯信息
 */
export async function getLifeInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家生涯信息, 并写入数据
 * @param {number} _uid 玩家id
 * @param {any} _lifeInfo 玩家生涯信息
 * @return 无返回值
 */
export async function setLifeInfo(_uid, _lifeInfo) {
    await SetInfo(_uid, _lifeInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

//#endregion