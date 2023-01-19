/**-----------------------------------------------
 description: 
    游戏数据文件，存储所有数据文件路径，
    开始游戏前初始化完成所有游戏数据

    插件游戏数据的插入，
    如果插件想要将装备道具地点加入常规设置
    请在插件根目录下创建文件 Init.js 实现方法 Init()
    然后调用AddData将想要加入的数据加入即可
 -----------------------------------------------**/

import fs from 'node:fs';
import path from 'path';


/** 插件根目录地址前缀 */
const __prePath = path.join(path.resolve(), 'plugins', 'Xiuxian-Plugin-Box');

/** 游戏数据地址前缀 */
const __gameDataPrePath = path.join(__prePath, 'resources', 'data', 'birth');

/** 不同模块游戏数据文件路径 */
const __gameDataPath = {
    players: path.join(__gameDataPrePath, 'player', 'players.json'),
    action: path.join(__gameDataPrePath, 'player', 'action'),
    battle: path.join(__gameDataPrePath, 'player', 'battle'),
    equipment: path.join(__gameDataPrePath, 'player', 'equipment'),
    level: path.join(__gameDataPrePath, 'player', 'level'),
    talent: path.join(__gameDataPrePath, 'player', 'talent'),
    backpack: path.join(__gameDataPrePath, 'player', 'backpack'),
    life: path.join(__gameDataPrePath, 'player', 'life'),
    warehouse: path.join(__gameDataPrePath, 'player', 'warehouse'),
    skill: path.join(__gameDataPrePath, 'player', 'skill'),
}

/** 不同模块游戏数据redis key */
const __gameDataKey = {
    players: 'xiuxian:players',
    action: 'xiuxian:player:actionInfo',
    battle: 'xiuxian:player:battleInfo',
    equipment: 'xiuxian:player:equipmentInfo',
    level: 'xiuxian:player:levelInfo',
    talent: 'xiuxian:player:talentInfo',
    backpack: 'xiuxian:player:backpackInfo',
    life: 'xiuxian:player:lifeInfo',
    warehouse: 'xiuxian:player:warehouseInfo',
    skill: 'xiuxian:player:skillInfo',
}

class Data {
    constructor() {
        if (!Data.instance) Data.instance = this;
        return Data.instance;
    }

    /** 游戏根目录地址前缀 */
    get __prePath() { return __prePath; }
    /** 不同模块游戏数据地址 */
    get __gameDataPath() { return __gameDataPath; }
    /** 不同模块游戏数据redis key */
    get __gameDataKey() { return __gameDataKey; }

    /** 几种预设数据组合类型 */
    fixType = ['items', 'areas', 'spots'];

    /******* 
     * @description: 读入所有预设组合数据
     * @return 无返回值
     */
    InitFixData = () => {
        this.fixType.forEach(type => {
            if (this[type] == undefined) this[type] = [];
            this[type].push(...getFixData(type));
        });
        //TODO：记得改！！！
        tmp();
    }

    /******* 
     * @description: 将所有预设组合数据写入文件保存
     * @return 无返回值
     */
    SaveFixData = () => {
        this.fixType.forEach(type => {
            saveFixData(type, this[type]);
        });
    }

    /******* 
     * @description: 插件在Init中调用该函数将插件数据加入常规设置
     * @param {string} _type 需添加的数据类型 见 fixType
     * @param {[]} _data 待添加的数据
     * @return 无返回值
     */
    AddFixData = (_type, _data) => {
        if (!this.fixType.includes(_type)) {
            logger.info(`无该预设类型:${_type}`);
            return;
        }
        if (this[_type] == undefined) this[_type] = [];
        this[_type].push(..._data);
    }
}
export default new Data();


/** 预设数据地址前缀 */
const __fixDataPrePath = path.join(__prePath, 'resources', 'data', 'fixed');

/** 不同模块预设数据文件路径 */
const __fixDataPath = {
    spot: path.join(__fixDataPrePath, 'spot'),
    area: path.join(__fixDataPrePath, 'area'),
    equipment: path.join(__fixDataPrePath, 'equipment'),
    goods: path.join(__fixDataPrePath, 'goods'),
    level: path.join(__fixDataPrePath, 'Level'),
    talent: path.join(__fixDataPrePath, 'talent'),
}

/** 预设组合生成数据地址与组合目录 */
const __def = {
    items: {
        name: 'allItem',
        path: path.join(__gameDataPrePath, 'item', 'allItem.json'),
        dirs: [__fixDataPath.equipment, __fixDataPath.goods]
    },
    areas: {
        name: 'allArea',
        path: path.join(__gameDataPrePath, 'area', 'allArea.json'),
        dirs: [__fixDataPath.area]
    },
    spots: {
        name: 'allSpot',
        path: path.join(__gameDataPrePath, 'spot', 'allSpot.json'),
        dirs: [__fixDataPath.spot]
    }
}

//临时处理，有时间改掉
function tmp() {
    const data = new Data();
    data.levelList = JSON.parse(fs.readFileSync(path.join(__fixDataPath.level, 'levelList.json')));
    data.bodyLevelList = JSON.parse(fs.readFileSync(path.join(__fixDataPath.level, 'bodyLevelList.json')));
    data.talentList = JSON.parse(fs.readFileSync(path.join(__fixDataPath.talent, 'talentList.json')));
}


/******* 
 * @description: 根据组合目录获取所有数据
 * @param {string} _type : 预定义组合
 * @return {[]} 返回目标组合所有数据，读取失败返回空[] 
 */
function getFixData(_type) {
    if (__def[_type] == undefined) {
        logger.error(`未定义${_type}!`);
        return [];
    }

    const ret = [];
    try {
        for (var dir of __def[_type].dirs) {
            fs.readdirSync(dir).filter(file => file.endsWith('.json')).forEach(file => {
                ret.push(...JSON.parse(fs.readFileSync(path.join(dir, file))));
            });
        }
    } catch (error) {
        logger.error(['读取预生成数据错误！', error]);
        return [];
    }

    return ret;
}

/******* 
 * @description: 根据组合目录保存所有数据
 * @param {string} _type : 预定义组合
 * @param {[]} _data : 数据
 * @return 无返回值
 */
function saveFixData(_type, _data) {
    if (__def[_type] == undefined) {
        logger.error(`未定义${_type}!`);
        return;
    }

    //添加游戏数据路径
    __gameDataPath[__def[_type].name] = __def[_type].path;

    //保存数据
    saveData(__def[_type].path, JSON.stringify(_data));
}

/******* 
 * @description: 保存数据，发生错误时报错
 * @param {string} _path 存储文件路径
 * @param {string} _data 文件数据
 * @return 无返回值
 */
function saveData(_path, _data) {
    fs.writeFile(_path, JSON.stringify(_data), (err) => {
        if (err) {
            logger.error(['保存数据错误！', _path, err]);
            return;
        }
    });
}

