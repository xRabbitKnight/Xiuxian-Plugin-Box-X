import base from './base.js';
import path from 'path'
import puppeteer from '../../../../../../lib/puppeteer/puppeteer.js';
import { GetCommodities } from '../Cache/shop.js';

/******* 
 * @description: 获取商店货物图片
 * @return {Promise<ImageElem>} oicq 图片
 */
export async function GetShopImage() {
    return await puppeteer.screenshot('shop', {
        //puppeteer 所需参数
        tplFile: path.join(base.html, 'shop', 'shop.html'),

        //模板传入参数
        cssPath: path.join(base.res, 'shop', 'shop.css'),
        commodities: await GetCommodities()
    });
}