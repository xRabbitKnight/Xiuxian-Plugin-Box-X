import data from '../../System/data.js';
import { ReadSync } from '../../File/File.js';
import { rand, forceNumber } from '../../mathCommon.js';

const redisKey = 'xiuxian:items';

/** ***** 
 * @description: 从cache里所有物品信息, 若没有则读文件, 读文件失败返回undefined
 * @return {Promise<JSON>} 返回的对应信息 JSON对象 物品信息数组
 */
export async function GetAll() {
    let value = await redis.get(redisKey);
    if (value == null) {
        value = ReadSync(data.__gameDataPath.allItem);
        if (value == undefined) return undefined;

        redis.set(redisKey, value);
    }
    return JSON.parse(value);
}

/******* 
 * @description: 获取指定类型全部物品
 * @param {[]} _types 指定类型数组 见id数据头 1武器2护具3法宝4丹药5功法6道具7技能书
 * @return {Promise<[]>} 物品数组，获取物品失败时返回undefined
 */
export async function GetAllItem(_types) {
    const items = await GetAll();
    if (items == undefined) return undefined;

    return items.filter(item => undefined != _types.find(type => type == item.id.split('-')[0]));
}

/******* 
 * @description: 获取随机数量的物品
 * @param {string} _type 物品种类，见id数据头 1武器2护具3法宝4丹药5功法6道具7技能书
 * @param {number} _count 需获取物品的数量, 不填默认为1
 * @param {number} _dropLevel 设置掉落等级，不填则全掉落
 * @return {Promise<[]>} 物品数组，获取物品失败时返回undefined
 */
export async function GetRandItem(_type, _count = 1, _dropLevel = undefined) {
    let items = await GetAllItem([_type]);
    if (items == undefined) return undefined;
    if (_dropLevel != undefined) items = items.filter(item => item.dropLevel <= _dropLevel);

    const ret = [];
    for (let i = 0; i < _count; ++i) {
        const item = items[rand(0, items.length)];
        const target = ret.find(tmp => tmp.id == item.id);

        if (target != undefined) {
            target.acount++;
        }
        else {
            item.acount = 1;
            ret.push(item);
        }
    }
    return ret;
}

/******* 
 * @description: 根据名字获取物品实例
 * @param {string} _name 物品名
 * @param {number} _count 获取数量
 * @return {Promise<any>} 对应物品
 */
export async function GetItemByName(_name, _count) {
    const items = await GetAll();
    if (items == undefined) return undefined;

    const item = items.find(item => item.name == _name);
    if (item == undefined) return undefined;

    item.acount = forceNumber(_count);
    return item;
}