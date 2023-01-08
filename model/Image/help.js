import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import base from './base.js';
import config from '../System/config.js';

/******* 
 * @description: 获取帮助指令信息
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetHelpImage(){
    return await puppeteer.screenshot('help', {
        //puppeteer 所需参数
        tplFile : base.html + 'help/help.html',
        
        //模板传入参数
        cssHelp : base.res + 'help/help.css',
        cssCommon : base.res + 'help/common.css',
        helpData : config.GetConfig('help/help.yaml')
    });
}

/******* 
 * @description: 获取管理员指令信息
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetAdminHelpImage(){
    return await puppeteer.screenshot('adminHelp', {
        //puppeteer 所需参数
        tplFile : base.html + 'help/help.html',
        
        //模板传入参数
        cssHelp : base.res + 'help/help.css',
        cssCommon : base.res + 'help/common.css',
        helpData : config.GetConfig('help/admin.yaml')
    });
}