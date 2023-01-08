/**-----------------------------------------------
 description: 
    游戏管理器，目前负责游戏开始前所有内容的初始化
    关于插件的初始化，请在插件根目录下创建 Init.js
    并实现方法 Init() 即可
 -----------------------------------------------**/

import plugin from '../../../../lib/plugins/plugin.js'
import fs from 'node:fs';
import path from 'path';
import data from './data.js';
import { RefreshMonster as InitMonster } from "../Region/Region.js";

class GameMgr {
    constructor() {
        if (!GameMgr.instance) GameMgr.instance = this;
        return GameMgr.instance;
    }

    get apps() { return getApps(); }

    async Init() {
        //游戏数据部分
        init();
        await pluginInit();
        save();

        //游戏内容部分
        InitMonster();
    }

}
export default new GameMgr();

function init() {
    data.Init();
}

function save(){
    data.Save();
}

async function pluginInit() {
    const dir = path.join(data.__prePath, 'plugins');

    const plugins = fs.readdirSync(dir);
    for (var plugin of plugins) {
        const targetFile = path.join(dir, plugin, 'Init.js');
        if (!fs.existsSync(targetFile)) continue;

        const init = (await import(targetFile))['Init'];
        if (init == undefined) continue;
        init();
    }
}

/******* 
 * @description: 获取app下以及插件目录app下所有继承plugin的类
 * @return {Promise<[]>}  
 */
async function getApps() {
    const apps = {};

    const dirs = [];
    //主游戏app目录
    dirs.push(path.join(data.__prePath, 'apps'))
    //所有插件app目录
    fs.readdirSync(path.join(data.__prePath, 'plugins')).forEach(plugin => dirs.push(path.join(data.__prePath, 'plugins', plugin, 'apps')));

    /**
     * 循环检查所有app下所有文件夹，获取js文件default导出，
     * 若是继承自plugin，加入apps
     */
    while (dirs.length > 0) {
        const files = fs.readdirSync(dirs[0]);

        for (var file of files) {
            const filePath = path.join(dirs[0], file);
            if (fs.statSync(filePath).isDirectory()) {
                dirs.push(filePath);
                continue;
            }

            const cls = (await import(filePath))['default'];
            if (cls != undefined && new cls() instanceof plugin) {
                apps[file] = cls;
            }
        }
        dirs.shift();
    }

    return apps;
}