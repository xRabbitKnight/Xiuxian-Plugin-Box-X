import data from '../../System/data.js';
import { lock } from '../base.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:equipmentInfo";
const PATH = data.__gameDataPath.equipment;

/******* 
 * @description: 从cache里获取玩家的装备信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的equipmentInfo JSON对象
 */
export async function GetEquipmentInfo(_uid) {
    return await GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家装备信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _equipmentInfo 玩家装备信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetEquipmentInfo(_uid, _equipmentInfo) {
    await SetInfo(_uid, _equipmentInfo, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 获取玩家的装备数量
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<number>} 装备数量
 */
export async function GetEquipmentCount(_uid) {
    const equipmentInfo = await GetEquipmentInfo(_uid);
    return equipmentInfo?.length;
}

/******* 
 * @description: 卸下装备
 * @param {string} _uid 玩家id
 * @param {*} _equipmentName 装备名
 * @return {*} 成功返回卸下的装备对象，失败返回undefined
 */
export async function DelEquipment(_uid, _equipmentName) {
    const equipmentInfo = await GetEquipmentInfo(_uid);
    let equipment = equipmentInfo?.find(item => item.name == _equipmentName);
    if (equipment == undefined) return undefined;

    equipment = equipmentInfo.splice(equipmentInfo.indexOf(equipment), 1);
    await SetEquipmentInfo(_uid, equipmentInfo);
    return equipment[0];
}

/******* 
 * @description: 装备新装备
 * @param {string} _uid 玩家id
 * @param {*} _equipment 装备对象
 * @return 无返回值
 */
export async function AddEquipment(_uid, _equipment) {
    lock(`${redisKey}:${_uid}`, async () => {
        const equipmentInfo = await GetEquipmentInfo(_uid);
        if (equipmentInfo == undefined) return;

        equipmentInfo.push(_equipment);
        await SetEquipmentInfo(_uid, equipmentInfo);
    });
}