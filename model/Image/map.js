import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import base from './base.js';

/******* 
 * @description: 获取地图
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetMap(){
    return await puppeteer.screenshot('map', {
        //puppeteer 所需参数
        tplFile : base.html + 'map/map.html',
        
        //模板传入参数
        cssPath : base.res + 'map/map.css',
    });
}