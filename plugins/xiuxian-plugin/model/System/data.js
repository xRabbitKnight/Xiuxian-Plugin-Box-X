import path from 'path'
import baseData from '../../../../model/System/data.js';

/** 插件根目录路径前缀 */
const __prePath = path.join(baseData.__prePath, 'plugins', 'xiuxian-plugin');

/** 插件config路径 */
const __configPath = path.join(__prePath, 'config');

/** 插件游戏数据路径前缀 */
const __pluginDataPrePath = path.join(__prePath, 'resources', 'data', 'birth');

/** 插件不同模块游戏数据路径 */
const __pluginDataPath = {
    shop: path.join(__pluginDataPrePath, 'shop.json'),
}

class Data {
    constructor() {
        if (!Data.instance) Data.instance = this;
        return Data.instance;
    }

    /** 插件根目录路径前缀 */
    get __prePath() { return __prePath; }

    /** 插件不同模块游戏数据路径 */
    get __pluginDataPath() { return __pluginDataPath; }

    /** 插件config路径 */
    get __configPath() { return __configPath; }
}
export default new Data();