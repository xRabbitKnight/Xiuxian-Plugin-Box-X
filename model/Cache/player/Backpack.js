import data from '../../System/data.js';
import path from 'path';
import { lock } from '../base.js';
import { forceNumber, compareByIdAsc } from '../../util';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = data.__gameDataKey.backpack;
const PATH = data.__gameDataPath.backpack;

//#region Get方法

/*******
 * @description: 获取玩家的背包信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 背包信息
 */
export async function GetBackpack(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getBackpackInfo(_uid);
    });
}

/*******
 * @description: 获取玩家背包灵石数量
 * @param {number} _uid 玩家id
 * @return {Promise<number>} 返回灵石数量，获取失败时返回undefined
 */
export async function GetBackpackSpiritStoneCount(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const backpackInfo = await getBackpackInfo(_uid);
        return backpackInfo?.spiritStone;
    });
}

/*******
 * @description: 检查背包灵石能否装下
 * @param {number} _uid 玩家id
 * @param {number} _count 增加的数量
 * @return {Promise<bool>} 能否装下
 */
export async function CheckBackpackSpiritStone(_uid, _count) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const backpackInfo = await getBackpackInfo(_uid);
        if (backpackInfo == undefined) return undefined;

        return backpackInfo.spiritStone + forceNumber(_count) <= backpackInfo.capacity;
    });
}

/******* 
 * @description: 在背包中按物品名字查找
 * @param {number} _uid 玩家id
 * @param {string} _itemName 物品名字
 * @return {Promise<any>} 若找到返回物品对象, 没找到返回undefined
 */
export async function GetBackpackItem(_uid, _itemName) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const backpackInfo = await getBackpackInfo(_uid);
        return backpackInfo?.items.find(item => item.name == _itemName);
    });
}

//#endregion

//#region Set方法

/*******
 * @description: 设置玩家的背包信息, 注意该方法会覆盖更新玩家背包, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _backpackInfo 玩家背包信息
 * @return 无返回值
 */
export async function SetBackpack(_uid, _backpackInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setBackpackInfo(_uid, _backpackInfo);
    });
}

/*******
 * @description: 增加背包灵石
 * @param {number} _uid 玩家id
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddSpiritStoneToBackpack(_uid, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const backpackInfo = await getBackpackInfo(_uid);
        if (backpackInfo == undefined) return;

        backpackInfo.spiritStone += forceNumber(_count);
        if (backpackInfo.spiritStone > backpackInfo.capacity) {
            Bot.sendPrivateMsg(_uid, '你的背包已满，灵石已经放不下了！');
            backpackInfo.spiritStone = backpackInfo.capacity;
        }
        await setBackpackInfo(_uid, backpackInfo);
    });
}

/******* 
 * @description: 按物品obj添加进背包
 * @param {number} _uid 玩家id
 * @param {any} _item 物品对象 JSON格式
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddItemToBackpack(_uid, _item, _count) {
    lock(`${redisKey}:${_uid}`, async () => {
        const backpackInfo = await getBackpackInfo(_uid);
        if (backpackInfo == undefined) return;

        _item.acount = forceNumber(_count);
        addVaild(backpackInfo, _item);
        await setBackpackInfo(_uid, backpackInfo);
    });
}

/******* 
 * @description: 批量添加物品进背包
 * @param {number} _uid 玩家id
 * @param {array} _items 物品数组
 * @return 无返回值
 */
export async function AddItemsToBackpack(_uid, ..._items) {
    lock(`${redisKey}:${_uid}`, async () => {
        const backpackInfo = await getBackpackInfo(_uid);
        if (backpackInfo == undefined) return;

        _items.forEach(item => addVaild(backpackInfo, item));
        await setBackpackInfo(_uid, backpackInfo);
    });
}

/******* 
 * @description: 背包物品排序
 * @param {number} _uid 玩家id
 * @return 无返回值
 */
export async function SortBackpackItem(_uid) {
    lock(`${redisKey}:${_uid}`, async () => {
        const backpackInfo = await getBackpackInfo(_uid);
        if (backpackInfo == undefined) return undefined;

        backpackInfo.items.sort((a, b) => compareByIdAsc(a.id, b.id));
        await setBackpackInfo(_uid, backpackInfo);
    });
}

//#endregion

//#region 内部方法

/*******
 * @description: 获取玩家的背包信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 背包信息
 */
async function getBackpackInfo(_uid) {
    return GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/*******
 * @description: 设置玩家的背包信息
 * @param {number} _uid 玩家id
 * @param {any} _backpackInfo 玩家背包信息
 * @return 无返回值
 */
async function setBackpackInfo(_uid, _backpackInfo) {
    await SetInfo(_uid, _backpackInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 合法添加物品
 * @param {any} _backpackInfo 背包信息
 * @param {any} _item 待添加的物品
 * @return 无返回值
 */
function addVaild(_backpackInfo, _item) {
    const targetItem = _backpackInfo.items.find(item => item.id == _item.id || item.name == _item.name);
    if (targetItem == undefined && _item.acount > 0) {    //当物品不存在且添加的物品数量>0时，直接push进去
        _backpackInfo.items.push(_item);
        return;
    }

    if (targetItem == undefined || targetItem.acount + _item.acount < 0) {    //若物品不存在且添加物品数量<0, 或者物品存在，但相加和仍<0，发生错误
        logger.error(`添加物品数量不合法！`);
        return;
    }

    targetItem.acount += _item.acount;
    if (targetItem.acount == 0) {     //物品存在，相加和=0，从列表中移除
        _backpackInfo.items.splice(_backpackInfo.items.indexOf(targetItem), 1);
    }
}

//#endregion
