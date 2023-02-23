import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import base from './base.js';
import config from '../System/config.js';
import {
    GetBattle, GetEquipment, GetLevel, GetTalent, GetLife, GetSkill, GetBackpack, GetWarehouse,
    SortBackpackItem, SortWarehouseItem
} from '../Cache';


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
        battle: await GetBattle(_uid),
        equipment: await GetEquipment(_uid),
    });
}

/******* 
 * @description: 获取玩家功法天赋信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetManualImage(_uid) {
    let talentInfo = await GetTalent(_uid);
    for(let item of talentInfo.manualList) {
        item.buffPercent = Math.round(item.buff / item.maxBuff * 100);
    }
    return await puppeteer.screenshot('manual', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/manual/manual.html',

        //模板传入参数
        cssPath: base.res + 'User/manual/manual.css',
        uid: _uid,
        talent: talentInfo,
    });
}

/******* 
 * @description: 获取玩家技能信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetSkillImage(_uid) {
    return await puppeteer.screenshot('skill', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/skill/skill.html',

        //模板传入参数
        cssPath: base.res + 'User/skill/skill.css',
        uid: _uid,
        skill: await GetSkill(_uid),
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
        life: await GetLife(_uid),
        battle: await GetBattle(_uid),
        level: await GetLevel(_uid),
        talent: await GetTalent(_uid),
        equipment: await GetEquipment(_uid),
    });
}

/******* 
 * @description: 获取玩家储物袋信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetBackpackImage(_uid) {
    SortBackpackItem(_uid);
    return await puppeteer.screenshot('backpack', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/backpack/backpack.html',

        //模板传入参数
        cssPath: base.res + 'User/backpack/backpack.css',
        uid: _uid,
        life: await GetLife(_uid),
        backpack: await GetBackpack(_uid)
    });
}

/******* 
 * @description: 获取玩家仓库信息
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetWarehouseImage(_uid) {
    await SortWarehouseItem(_uid);
    return await puppeteer.screenshot('backpack', {
        //puppeteer 所需参数
        tplFile: base.html + 'User/warehouse/warehouse.html',

        //模板传入参数
        cssPath: base.res + 'User/warehouse/warehouse.css',
        uid: _uid,
        life: await GetLife(_uid),
        warehouse: await GetWarehouse(_uid)
    });
}

/******* 
 * @description: 获取练气境界说明
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetLevelImage(_uid) {
    return await puppeteer.screenshot('state', {
        //puppeteer 所需参数
        tplFile: base.html + 'state/state.html',

        //模板传入参数
        cssPath: base.res + 'state/state.css',
        name: '练气境界',
        list: config.GetConfig(['game', 'player.yaml']).levelList,
        level: (await GetLevel(_uid)).level
    });
}

/******* 
 * @description: 获取炼体境界说明
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetBodyLevelImage(_uid) {
    return await puppeteer.screenshot('state', {
        //puppeteer 所需参数
        tplFile: base.html + 'state/state.html',

        //模板传入参数
        cssPath: base.res + 'state/state.css',
        name: '炼体境界',
        list: config.GetConfig(['game', 'player.yaml']).bodyLevelList,
        level: (await GetLevel(_uid)).bodyLevel
    });
}