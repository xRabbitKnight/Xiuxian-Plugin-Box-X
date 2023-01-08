import Yaml from 'yaml';
import { ReadSync } from '../File/File.js';

/** config前置路径*/
const configPath = './plugins/Xiuxian-Plugin-Box/config/';

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
     * @return {*} 解析后的对象
     */    
    GetConfig(_path){
        if(configCache[_path] == undefined){
            configCache[_path] = Yaml.parse(ReadSync(`${configPath}${_path}`));
        }   
        return configCache[_path];
    }
}
export default new Config();