import data from '../../System/data.js';
import path from 'path';
import { forceNumber, compareByIdAsc, lock } from '../../util';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = data.__gameDataKey.warehouse;
const PATH = data.__gameDataPath.warehouse;

//#region Get方法

/******* 
 * @description: 获取玩家的仓库信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 仓库信息
 */
export async function GetWarehouse(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getWarehouseInfo(_uid);
    });
}

/******* 
 * @description: 在仓库中按物品名字查找
 * @param {number} _uid 玩家id
 * @param {string} _itemName 物品名字
 * @return {Promise<any>} 若找到返回物品对象, 没找到返回undefined
 */
export async function GetWarehouseItem(_uid, _itemName) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const warehouseInfo = await getWarehouseInfo(_uid);
        return warehouseInfo?.items.find(item => item.name == _itemName);
    });
}

/*******
 * @description: 获取玩家仓库灵石数量
 * @param {number} _uid 玩家id
 * @return {Promise<number>} 返回灵石数量，获取失败时返回undefined
 */
export async function GetWarehouseSpiritStoneCount(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const warehouseInfo = await getWarehouseInfo(_uid);
        return warehouseInfo?.spiritStone;
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 更新玩家仓库信息, 注意该方法会覆盖更新玩家仓库信息, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _warehouseInfo 玩家仓库信息
 * @return 无返回值
 */
export async function SetWarehouse(_uid, _warehouseInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setWarehouseInfo(_uid, _warehouseInfo);
    });
}

/*******
 * @description: 增加仓库灵石
 * @param {number} _uid 玩家id
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddSpiritStoneToWarehouse(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const warehouseInfo = await getWarehouseInfo(_uid);
        if (warehouseInfo == undefined) return;

        warehouseInfo.spiritStone += forceNumber(_count);
        await setWarehouseInfo(_uid, warehouseInfo);
    });
}

/******* 
 * @description: 按物品obj添加进仓库
 * @param {number} _uid 玩家id
 * @param {any} _item 物品对象
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddItemToWarehouse(_uid, _item, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const warehouseInfo = await getWarehouseInfo(_uid);
        if (warehouseInfo == undefined) return;

        _item.acount = forceNumber(_count);
        addVaild(warehouseInfo, _item);
        await setWarehouseInfo(_uid, warehouseInfo);
    });
}

/******* 
 * @description: 批量添加物品进仓库
 * @param {number} _uid 玩家id
 * @param {array} _items 物品数组
 * @return 无返回值
 */
export async function AddItemsToWarehouse(_uid, ..._items) {
    lock(`${redisKey}:${_uid}`, async () => {
        const warehouseInfo = await getWarehouseInfo(_uid);
        if (warehouseInfo == undefined) return;

        _items.forEach(item => addVaild(warehouseInfo, item));
        await setWarehouseInfo(_uid, warehouseInfo);
    });
}

/******* 
 * @description: 背包物品排序
 * @param {number} _uid 玩家id
 * @return 无返回值
 */
export async function SortWarehouseItem(_uid) {
    lock(`${redisKey}:${_uid}`, async () => {
        const warehouseInfo = await getWarehouseInfo(_uid);
        if (warehouseInfo == undefined) return;

        warehouseInfo.items.sort((a, b) => compareByIdAsc(a.id, b.id));
        await setWarehouseInfo(_uid, warehouseInfo);
    });
}

//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的仓库信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 仓库信息
 */
export async function getWarehouseInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家仓库信息, 并写入数据
 * @param {number} _uid 玩家id
 * @param {any} _warehouseInfo 玩家仓库信息
 * @return 无返回值
 */
export async function setWarehouseInfo(_uid, _warehouseInfo) {
    await SetInfo(_uid, _warehouseInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 合法添加物品
 * @param {*} _warehouseInfo 玩家仓库信息
 * @param {*} _item 待添加的物品
 * @return 无返回值
 */
function addVaild(_warehouseInfo, _item) {
    const targetItem = _warehouseInfo.items.find(item => item.id == _item.id || item.name == _item.name);
    if (targetItem == undefined && _item.acount > 0) {    //当物品不存在且添加的物品数量>0时，直接push进去
        _warehouseInfo.items.push(_item);
        return;
    }

    if (targetItem == undefined || targetItem.acount + _item.acount < 0) {    //若物品不存在且添加物品数量<0, 或者物品存在，但相加和仍<0，发生错误
        logger.error(`添加物品数量不合法！`);
        return;
    }

    targetItem.acount += _item.acount;
    if (targetItem.acount == 0) {     //物品存在，相加和=0，从列表中移除
        _warehouseInfo.items.splice(_warehouseInfo.items.indexOf(targetItem), 1);
    }
}

//#endregion