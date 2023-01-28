import data from '../../System/data.js';
import path from 'path';
import { GetInfo, SetInfo } from './InfoCache.js';
import { lock } from '../base.js';

const redisKey = data.__gameDataKey.action;
const PATH = data.__gameDataPath.action;

//#region Get方法

/******* 
 * @description: 获取玩家的行为信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 行为信息
 */
export async function GetAction(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getActionInfo(_uid);
    });
}

/******* 
 * @description: 获取玩家所在区域
 * @param {number} _uid 玩家id
 * @return {Promise<number>} 区域编号，获取失败返回undefined
 */
export async function GetPlayerRegion(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const actionInfo = await getActionInfo(_uid);
        return actionInfo?.region;
    });
}

/******* 
 * @description: 检查玩家是否领取萌新礼包
 * @param {number} _uid 玩家id
 * @return {Promise<bool>}  是->true
 */
export async function IsNew(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const actionInfo = await getActionInfo(_uid);
        return actionInfo?.new;
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 更新玩家行为信息, 注意该方法会覆盖更新玩家行为信息, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _actionInfo 玩家面板信息
 * @return 无返回值
 */
export async function SetAction(_uid, _actionInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setActionInfo(_uid, _actionInfo);
    });
}

/******* 
 * @description: 登记玩家领取萌新礼包
 * @param {number} _uid 玩家id
 * @return 无返回值
 */
export async function RegNew(_uid) {
    lock(`${redisKey}:${_uid}`, async () => {
        const actionInfo = await getActionInfo(_uid);
        actionInfo.new = false;
        await setActionInfo(_uid, actionInfo);
    });
}

//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的行为信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 行为信息
 */
async function getActionInfo(_uid) {
    return GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家行为信息, 并写入数据
 * @param {number} _uid 玩家id
 * @param {any} _actionInfo 玩家面板信息
 * @return 无返回值
 */
async function setActionInfo(_uid, _actionInfo) {
    await SetInfo(_uid, _actionInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

//#endregion