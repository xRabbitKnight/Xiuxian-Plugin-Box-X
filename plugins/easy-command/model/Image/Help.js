import path from 'path'
import puppeteer from '../../../../../../lib/puppeteer/puppeteer.js';
import { CONFIG } from '../../Init.js';

/******* 
 * @description: 获取插件帮助指令信息
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function getHelpImage(){
    return await puppeteer.screenshot('easy-command-help', {
        //puppeteer 所需参数
        tplFile: path.join(CONFIG.resPath, 'html/help/help.html'),

        //模板传入参数
        cssPath: path.join(CONFIG.resPath, 'html/help/help.css'),
    });
}