import data from '../../System/data.js';
import { forceNumber } from '../../mathCommon.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:warehouseInfo";
const PATH = data.__gameDataPath.warehouse;

/******* 
 * @description: 从cache里获取玩家的仓库信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetWarehouseInfo(_uid) {
    return await GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家仓库信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _warehouseInfo 玩家仓库信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetWarehouseInfo(_uid, _warehouseInfo) {
    SetInfo(_uid, _warehouseInfo, redisKey, `${PATH}/${_uid}.json`);
}


/******* 
 * @description: 在仓库中按物品名字查找
 * @param {string} _uid 玩家id
 * @param {string} _itemName 物品名字
 * @return {Promise<JSON>} 若找到返回物品对象JSON, 没找到返回undefined
 */
export async function GetItemByName(_uid, _itemName) {
    const warehouseInfo = await GetWarehouseInfo(_uid);
    return warehouseInfo?.items.find(item => item.name == _itemName);
}

/*******
 * @description: 增加仓库灵石
 * @param {string} _uid 玩家id
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddSpiritStone(_uid, _count) {
    const warehouseInfo = await GetWarehouseInfo(_uid);
    if (warehouseInfo == undefined) return;
    warehouseInfo.lingshi += forceNumber(_count);
    SetWarehouseInfo(_uid, warehouseInfo);
}

/******* 
 * @description: 按物品obj添加进仓库
 * @param {string} _uid 玩家id
 * @param {JSON} _item 物品对象 JSON格式
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddItemByObj(_uid, _item, _count) {
    const warehouseInfo = await GetWarehouseInfo(_uid);
    if (warehouseInfo == undefined) return;

    _item.acount = forceNumber(_count);
    addVaild(warehouseInfo, _item);

    SetWarehouseInfo(_uid, warehouseInfo);
}

/******* 
 * @description: 背包物品排序
 * @param {string} _uid 玩家id
 * @return 无返回值
 */
export async function SortById(_uid) {
    const warehouseInfo = await GetWarehouseInfo(_uid);
    warehouseInfo.items.sort((a, b) => a.id.localeCompare(b.id));
    SetWarehouseInfo(_uid, warehouseInfo);
}

/*******--------------------------------------------------------------内部函数
 * @description: 合法添加物品
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