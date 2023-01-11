import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import base from './base.js';
import config from '../System/config.js';

export async function HelpBase(_helpData){
    return await puppeteer.screenshot('help', {
        //puppeteer 所需参数
        tplFile : base.html + 'help/help.html',
        
        //模板传入参数
        cssHelp : base.res + 'help/help.css',
        cssCommon : base.res + 'help/common.css',
        helpData : _helpData
    });
}

/******* 
 * @description: 获取帮助指令信息
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetHelpImage(){
    return await HelpBase(config.GetConfig('help/help.yaml'));
}

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