import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import base from './base.js';
import { GetBattleInfo } from '../Cache/player/Battle.js';
import { GetEquipmentInfo } from '../Cache/player/Equipment.js';
import { GetLevelInfo } from '../Cache/player/Level.js';
import { GetTalentInfo } from '../Cache/player/Talent.js';
import { GetLifeInfo } from '../Cache/player/Life.js';
import { GetBackpackInfo, SortById as SortBackpack } from '../Cache/player/Backpack.js';
import { GetWarehouseInfo, SortById as SortWarehouse } from '../Cache/player/Warehouse.js';

/******* 
 * @description: 获取玩家装备以及面板信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetEquipmentImage(_uid) {
    return await puppeteer.screenshot('equipment', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/equipment/equipment.html',

        //模板传入参数
        cssPath: base.res + 'User/equipment/equipment.css',
        uid: _uid,
        battle: await GetBattleInfo(_uid),
        equipment: await GetEquipmentInfo(_uid),
    });
}

/******* 
 * @description: 获取玩家基础信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetPlayerInfoImage(_uid) {
    return await puppeteer.screenshot('playerInfo', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/player/player.html',

        //模板传入参数
        cssPath: base.res + 'User/player/player.css',
        uid: _uid,
        life: await GetLifeInfo(_uid),
        battle: await GetBattleInfo(_uid),
        level: await GetLevelInfo(_uid),
        talent: await GetTalentInfo(_uid),
        equipment: await GetEquipmentInfo(_uid),
    });
}

/******* 
 * @description: 获取玩家储物袋信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetBackpackImage(_uid) {
    await SortBackpack(_uid);
    return await puppeteer.screenshot('backpack', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/najie/najie.html',

        //模板传入参数
        cssPath: base.res + 'User/najie/najie.css',
        uid: _uid,
        life: await GetLifeInfo(_uid),
        backpack: await GetBackpackInfo(_uid)
    });
}

/******* 
 * @description: 获取玩家仓库信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetWarehouseImage(_uid) {
    await SortWarehouse(_uid);
    return await puppeteer.screenshot('backpack', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/warehouse/warehouse.html',

        //模板传入参数
        cssPath: base.res + 'User/warehouse/warehouse.css',
        uid: _uid,
        life: await GetLifeInfo(_uid),
        warehouse: await GetWarehouseInfo(_uid)
    });
}