import data from '../../System/data.js';
import path from 'path';
import { lock } from '../../util';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = data.__gameDataKey.equipment;
const PATH = data.__gameDataPath.equipment;

//#region Get方法

/******* 
 * @description: 获取玩家的装备信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 返回的equipmentInfo JSON对象
 */
export async function GetEquipment(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getEquipmentInfo(_uid);
    });

}

/******* 
 * @description: 获取玩家的装备数量
 * @param {number} _uid 玩家id
 * @return {Promise<number>} 装备数量
 */
export async function GetEquipmentCount(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const equipmentInfo = await getEquipmentInfo(_uid);
        return equipmentInfo?.length;
    });
}

/******* 
 * @description: 卸下装备
 * @param {number} _uid 玩家id
 * @param {string} _equipmentName 装备名
 * @return {Promise<any>} 成功返回卸下的装备对象，失败返回undefined
 */
export async function DelEquipment(_uid, _equipmentName) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const equipmentInfo = await getEquipmentInfo(_uid);
        let equipment = equipmentInfo?.find(item => item.name == _equipmentName);
        if (equipment == undefined) return undefined;

        equipment = equipmentInfo.splice(equipmentInfo.indexOf(equipment), 1);
        await setEquipmentInfo(_uid, equipmentInfo);
        return equipment[0];
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 设置玩家装备信息 注意该方法会覆盖更新玩家装备信息, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _equipmentInfo 玩家装备信息
 * @return 无返回值
 */
export async function SetEquipment(_uid, _equipmentInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setEquipmentInfo(_uid, _equipmentInfo);
    });
}

/******* 
 * @description: 装备新装备
 * @param {string} _uid 玩家id
 * @param {*} _equipment 装备对象
 * @return 无返回值
 */
export async function AddEquipment(_uid, _equipment) {
    lock(`${redisKey}:${_uid}`, async () => {
        const equipmentInfo = await getEquipmentInfo(_uid);
        if (equipmentInfo == undefined) return;

        equipmentInfo.push(_equipment);
        await setEquipmentInfo(_uid, equipmentInfo);
    });
}

//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的装备信息
 * @param {string} _uid 玩家id
 * @return {Promise<any>} 返回的equipmentInfo JSON对象
 */
export async function getEquipmentInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家装备信息, 并写入数据
 * @param {string} _uid 玩家id
 * @param {any} _equipmentInfo 玩家装备信息
 * @return 无返回值
 */
export async function setEquipmentInfo(_uid, _equipmentInfo) {
    await SetInfo(_uid, _equipmentInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

//#endregion