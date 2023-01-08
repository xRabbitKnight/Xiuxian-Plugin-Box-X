import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import base from './base.js';
import data from '../System/data.js';
import { GetLevelInfo } from '../Cache/player/Level.js';

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
        list: data.levelList,
        level : (await GetLevelInfo(_uid)).level
    });
}

/******* 
 * @description: 获取炼体境界说明
 * @param {string} _uid 玩家id, plugins参数e.user_id
 * @return {Promise<ImageElem>} 生成的图片
 */
 export async function GetLevelmaxImage(_uid) {
    return await puppeteer.screenshot('state', {
        //puppeteer 所需参数
        tplFile: base.html + 'state/state.html',

        //模板传入参数
        cssPath: base.res + 'state/state.css',
        name: '炼体境界',
        list: data.bodyLevelList,
        level : (await GetLevelInfo(_uid)).bodyLevel
    });
}