import path from 'path'
import data from '../../../../model/System/data.js';

/** 插件根目录路径前缀 */
const __prePath = path.join(data.__prePath, 'plugins', 'xiuxian-plugin');

/** 插件config路径 */
const __configPath = path.join(__prePath, 'config');

class Data {
    constructor() {
        if (!Data.instance) Data.instance = this;
        return Data.instance;
    }

    /** 插件根目录路径前缀 */
    get __prePath() { return __prePath; }

    /** 插件config路径 */
    get __configPath() { return __configPath; }
}
export default new Data();