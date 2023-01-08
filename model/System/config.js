import YAML from 'yaml';
import data from './data.js';
import path from 'path';
import { ReadSync } from '../File/File.js';

/** config前置路径*/
const configPath = path.join(data.__prePath, 'config');

/** config缓存，减少读文件时间 */
const configCache = {};


class Config{
    constructor(){
        if(!Config.instance) Config.instance = this;
        return Config.instance;
    }

    /******* 
     * @description: 获取对应config中信息
     * @param {string} _path 目标路径,只需要提供config后路径即可  eg. game/player.yaml
     * @param {string} _prePath 前置路径，插件调用时需填插件前置路径
     * @return {*} 解析后的对象
     */    
    GetConfig(_path, _prePath = configPath){
        if(configCache[_path] == undefined){
            configCache[_path] = YAML.parse(ReadSync(path.join(_prePath, _path)));
        }   
        return configCache[_path];
    }
}
export default new Config();