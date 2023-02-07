import data from '../../System/data.js';
import path from 'path';
import config from "../../System/config.js";
import { ReadSync } from '../../File/File.js';
import { forceNumber } from '../../util/math.js';
import { cloneObj, randItem } from '../../util/commonUtil.js';
import { mergeItems } from '../../util/gameUtil.js';

const redisKey = 'xiuxian:items';

/******* 
 * @description: 获取指定类别全部物品
 * @param {array} _names 指定类别数组 eg 武器,护具,法宝,丹药,功法,道具,技能书 详细类别参考config/game/items.yaml
 * @return {Promise<[]>} 物品数组，获取物品失败时返回undefined
 */
export async function GetItems(..._names) {
    const items = await getAll();
    if (items == undefined) return undefined;

    let regs = [];
    _names.forEach(name => regs.push(GetItemReg(name)?.source));
    regs.filter(reg => reg != undefined);
    const reg = RegExp(regs.join('|'));

    return items.filter(item => reg.test(item.id));
}

/******* 
 * @description: 获取随机数量的物品
 * @param {string} _type 物品种类，eg 武器,护具,法宝,丹药,功法,道具,技能书 详细类别参考config/game/items.yaml
 * @param {number} _count 需获取物品的数量, 不填默认为1
 * @param {number} _dropLevel 设置掉落等级，不填则全掉落
 * @return {Promise<[]>} 物品数组，获取物品失败时返回undefined
 */
export async function GetRandItem(_type, _count = 1, _dropLevel = undefined) {
    let items = await GetItems(_type);
    if (items == undefined) return undefined;
    if (_dropLevel != undefined) items = items.filter(item => item.dropLevel <= _dropLevel);

    const ret = [];
    for (let i = 0; i < _count; ++i)
        ret.push(cloneObj(randItem(items)));

    return mergeItems(...ret);
}

/******* 
 * @description: 根据名字获取物品实例
 * @param {string} _name 物品名
 * @param {number} _count 获取数量
 * @return {Promise<any>} 对应物品
 */
export async function GetItemObj(_name, _count) {
    const items = await getAll();
    if (items == undefined) return undefined;

    const item = items.find(item => item.name == _name);
    if (item == undefined) return undefined;

    item.acount = forceNumber(_count);
    return item;
}

/**
 * @description: 获取物品某属性某类别正则表达式，配置在config/game/items.yaml
 * @param {string} _name 类别名
 * @param {string} _type 物品属性正则名 默认为'idReg', 即获取id正则
 * @return {RegExp} 成功获取返回正则表达式，未找到返回undefined
 */
export function GetItemReg(_name, _type = 'idReg') {
    const regs = config.GetConfig(path.join('game', 'items.yaml'))[_type];
    if (regs == undefined || regs[_name] == undefined) {
        logger.warn(`${_name} 未定义正则表达式！`);
        return undefined;
    }
    return new RegExp(regs[_name]);
}

/**
 * @description: 通过正则过滤物品
 * @param {string} _attr 正则匹配的物品属性
 * @param {RegExp} _reg 过滤物品的正则
 * @param {[]} _items 待过滤所有物品
 * @return {{included:[], excluded:[]}} 符合要求的物品列表，被滤除的物品列表
 */
export function FilterItemByIdReg(_attr, _reg, _items) {
    const included = [], excluded = [];
    _items.forEach(item =>
        _reg.test(item[_attr]) ? included.push(item) : excluded.push(item)
    );
    return { included, excluded };
}

/** ***** 
 * @description: 从cache里所有物品信息, 若没有则读文件, 读文件失败返回undefined
 * @return {Promise<JSON>} 返回的对应信息 JSON对象 物品信息数组
 */
export async function getAll() {
    let value = await redis.get(redisKey);
    if (value == null) {
        value = ReadSync(data.__gameDataPath.allItem);
        if (value == undefined) return undefined;

        redis.set(redisKey, value);
    }
    return JSON.parse(value);
}