import { HelpBase } from "../../../../model/Image/help.js";
import config from "../../../../model/System/config.js";
import data from "../System/data.js";


/******* 
 * @description: 获取扩展插件帮助指令信息
 * @return {Promise<ImageElem>} 生成的图片
 */
export async function GetPluginHelpImage() {
    return await HelpBase(config.GetConfig(['help', 'plugin.yaml'], data.__configPath));
}