import { __PATH } from '../../apps/Xiuxian/Xiuxian.js';
import { forceNumber } from '../mathCommon.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:BackpackInfo";
const PATH = __PATH.najie;

/******* 
 * @description: 从cache里获取玩家的背包信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的backpackInfo JSON对象
 */
export async function GetBackpackInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家背包信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _backpackInfo 玩家背包信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetBackpackInfo(_uid, _backpackInfo) {
    SetInfo(_uid, _backpackInfo, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 增加灵石
 * @param {string} _uid 玩家id
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddSpiritStone(_uid, _count){
    const backpackInfo = await GetBackpackInfo(_uid);
    if(backpackInfo == undefined) return;
    backpackInfo.lingshi += forceNumber(_count);
    SetBackpackInfo(_uid, backpackInfo);
}

/******* 
 * @description: 按物品obj添加进背包
 * @param {string} _uid 玩家id
 * @param {JSON} _item 物品对象 JSON格式
 * @param {number} _count 增加的数量
 * @return 无返回值
 */
export async function AddItemByObj(_uid, _item, _count){
    const backpackInfo = await GetBackpackInfo(_uid);
    if(backpackInfo == undefined) return;

    _item.acount = forceNumber(_count);
    addVaild(backpackInfo, _item);
    
    SetBackpackInfo(_uid, backpackInfo);
}

export async function AddItemByName(_uid, _itemName, _count){

}

export async function AddItemById(_uid, _itemId, _count){

}

//合法添加物品
function addVaild(_backpackInfo, _item){
    const targetItem = _backpackInfo.thing.find(item => item.id == _item.id || item.name == _item.name); 
    if(targetItem == undefined){
        _backpackInfo.thing.push(_item);
        return;
    }

    if(targetItem.acount + _item.acount < 0){
        logger.error(`添加物品数量不合法！`);
        return;
    }

    targetItem.acount += _item.acount;
    if(targetItem.acount == 0){
        _backpackInfo.thing.splice(_backpackInfo.thing.indexOf(targetItem), 1);
    }
}
