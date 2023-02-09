import YAML from 'yaml';
import path from 'path';
import { ReadSync, WriteAsync } from '../File/File.js';

/** config前置路径*/
const configPath = path.join(path.resolve(), 'plugins', 'Xiuxian-Plugin-Box', 'config');

/** config缓存，减少读文件时间 */
const configCache = {};

class Config {
    constructor() {
        if (!Config.instance) Config.instance = this;
        return Config.instance;
    }

    /******* 
     * @description: 获取对应config中信息
     * @param {string[]} _path 目标路径,只需要提供config后路径即可  eg. ['game', 'player.yaml']
     * @param {string} _prePath 前置路径，插件调用时需填插件前置路径
     * @return {*} 解析后的对象
     */
    GetConfig(_path, _prePath = configPath) {
        const target = path.join(_prePath, ..._path);
        if (configCache[target] == undefined) {
            configCache[target] = YAML.parse(ReadSync(target));
        }
        return configCache[target];
    }

    /******* 
     * @description: 写config，注意目前没做校验，注意使用！
     * @param {string[]} _path 目标路径,只需要提供config后路径即可  eg. ['game', 'player.yaml']
     * @param {object} _cfg 写入cfg内容，以对象的形式输入
     * @param {string} _prePath 前置路径，插件调用时需填插件前置路径
     * @return 无返回值
     */
    SetConfig(_path, _cfg, _prePath = configPath) {
        const target = path.join(_prePath, ..._path);
        configCache[target] = _cfg;
        WriteAsync(target, YAML.stringify(_cfg));
    }
}
export default new Config();