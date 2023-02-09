import config from '../../System/config.js';
import data from '../../System/data.js';
import path from 'path';
import { GetInfo, SetInfo } from './InfoCache.js';
import { rand, lock } from '../../util';

const redisKey = data.__gameDataKey.talent;
const PATH = data.__gameDataPath.talent;

//#region Get方法

/******* 
 * @description: 获取玩家的天赋信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 天赋信息
 */
export async function GetTalent(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getTalentInfo(_uid);
    });
}

/**
 * @description: 获取一份新玩家战斗面板
 * @return {Promise<any>} talentInfo对象
 */
export async function GetNewTalent() {
    const talentInfo = {};
    talentInfo.spiritualRoot = randSpiritualRoot();
    talentInfo.spiritualRootName = getSpiritualRootName(talentInfo.spiritualRoot);
    talentInfo.show = false;
    talentInfo.manualList = [];
    talentInfo.buff = getBuff(talentInfo.spiritualRoot, talentInfo.manualList);
    return talentInfo;
}

/******* 
 * @description: 获取玩家的修炼天赋加成
 * @param {number} _uid 玩家id
 * @return {Promise<number>} 修炼天赋加成
 */
export async function GetTalentBuff(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const talentInfo = await getTalentInfo(_uid);
        return talentInfo?.buff;
    });
}

/******* 
 * @description: 获取玩家的灵根信息
 * @param {number} _uid 玩家id
 * @return {Promise<[]>} 灵根数组
 */
export async function GetSpiritualRoot(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const talentInfo = await getTalentInfo(_uid);
        return talentInfo?.spiritualRoot;
    });
}

/******* 
 * @description: 学习新功法
 * @param {number} _uid 玩家id
 * @param {any} _manual 功法对象
 * @return {Promise<boolean>} 返回是否学习成功 true->学习成功
 */
export async function AddManual(_uid, _manual) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const talentInfo = await getTalentInfo(_uid);
        const maxLearnNum = config.GetConfig(['game', 'player.yaml']).maxManual;

        if (talentInfo.manualList.find(item => item.name == _manual.name) != undefined || talentInfo.manualList.length >= maxLearnNum) {
            return false;
        }

        talentInfo.manualList.push({
            name: _manual.name,
            buff: _manual.size,
            maxBuff: Math.floor(_manual.size * 1.5),
        });

        talentInfo.buff += _manual.size;
        await setTalentInfo(_uid, talentInfo);
        return true;
    });
}

/******* 
 * @description: 忘掉功法
 * @param {number} _uid 玩家id
 * @param {any} _manualName 功法名
 * @return {Promise<boolean>} 返回是否忘掉成功 true->忘掉成功
 */
export async function DelManual(_uid, _manualName) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const talentInfo = await getTalentInfo(_uid);

        const targetManual = talentInfo.manualList.find(item => item.name == _manualName);
        if (targetManual == undefined) {
            return false;
        }

        talentInfo.manualList.splice(talentInfo.manualList.indexOf(targetManual), 1);
        talentInfo.buff -= targetManual.buff;
        await setTalentInfo(_uid, talentInfo);
        return true;
    });
}

/******* 
 * @description: 钻研功法, 增加功法效率
 * @param {number} _uid 玩家id
 * @param {any} _manualName 功法名
 * @return {Promise<boolean>} 返回是否钻研成功 true->忘掉成功
 */
export async function AddManualBuff(_uid, _manualName) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const talentInfo = await getTalentInfo(_uid);

        const targetManual = talentInfo.manualList.find(item => item.name == _manualName);
        if (targetManual == undefined) {
            return false;
        }

        talentInfo.buff -= targetManual.buff;
        targetManual.buff = Math.min(targetManual.maxBuff, Math.floor(targetManual.buff * 1.05));
        talentInfo.buff += targetManual.buff;

        await setTalentInfo(_uid, talentInfo);
        return true;
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 更新玩家天赋信息, 注意该方法会覆盖更新玩家天赋信息, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _talentInfo 玩家天赋信息
 * @return 无返回值
 */
export async function SetTalent(_uid, _talentInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setTalentInfo(_uid, _talentInfo);
    });
}

/******* 
 * @description: 生成新的灵根并重新计算天赋
 * @param {number} _uid 玩家id
 * @return 无返回值
 */
export async function GenerateNewSpiritualRoot(_uid) {
    lock(`${redisKey}:${_uid}`, async () => {
        const talentInfo = await getTalentInfo(_uid);

        talentInfo.spiritualRoot = randSpiritualRoot();
        talentInfo.spiritualRootName = getSpiritualRootName(talentInfo.spiritualRoot);
        talentInfo.buff = getBuff(talentInfo.spiritualRoot, talentInfo.manualList);
        await setTalentInfo(_uid, talentInfo);
    });
}

/******* 
 * @description: 设置玩家天赋是否显示
 * @param {number} _uid 玩家id
 * @param {boolean} _type 是否显示 true -> 显示
 * @return 无返回值
 */
export async function SetTalentOnShow(_uid, _type) {
    lock(`${redisKey}:${_uid}`, async () => {
        const talentInfo = await getTalentInfo(_uid);

        talentInfo.show = _type;
        await setTalentInfo(_uid, talentInfo);
    });
}

//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的天赋信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 天赋信息
 */
export async function getTalentInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家天赋信息, 并写入数据
 * @param {number} _uid 玩家id
 * @param {any} _talentInfo 玩家天赋信息
 * @return 无返回值
 */
export async function setTalentInfo(_uid, _talentInfo) {
    await SetInfo(_uid, _talentInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

/**
 * @description: 随机生成灵根
 * @return {[]} 灵根数组
 */
function randSpiritualRoot() {
    const spRoot = [];
    const time = rand(1, 11); //尝试次数
    for (let i = 0; i < time; i++) {
        const sr = rand(0, 10);
        if (-1 != spRoot.indexOf(sr)) continue;
        if (sr < 5 && -1 != spRoot.indexOf(sr + 5)) continue;
        if (sr >= 5 && -1 != spRoot.indexOf(sr - 5)) continue;
        spRoot.push(sr);
    }
    return spRoot;
}

/**
 * @description:  根据灵根数组获取灵根名
 * @param {[]} _spRoot 灵根数组
 * @return {string} 返回灵根名
 */
function getSpiritualRootName(_spRoot) {
    let name = "";
    const cfg = config.GetConfig(['game', 'player.yaml']);
    _spRoot.forEach(root => name += cfg.spritualRoot[root]);
    return name;
}

/**
 * @description: 根据灵根和功法计算修炼效率
 * @param {[]} _spRoot 灵根数组
 * @param {[]} _manualList 功法数组
 * @return {number} 修炼效率
 */
function getBuff(_spRoot, _manualList) {
    let buff = 250;
    _spRoot.forEach(root => buff -= (root >= 5 ? 40 : 50));
    _manualList.forEach(manual => buff += manual.buff);
    return buff;
}

//#endregion