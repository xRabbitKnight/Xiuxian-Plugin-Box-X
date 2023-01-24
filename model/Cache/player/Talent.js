import config from '../../System/config.js';
import data from '../../System/data.js';
import path from 'path';
import { GetInfo, SetInfo } from './InfoCache.js';
import { rand } from '../../util/math.js';

const redisKey = data.__gameDataKey.talent;
const PATH = data.__gameDataPath.talent;

/******* 
 * @description: 从cache里获取玩家的天赋信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的TalentInfo JSON对象
 */
export async function GetTalentInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家天赋信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _talentInfo 玩家天赋信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetTalentInfo(_uid, _talentInfo) {
    await SetInfo(_uid, _talentInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

/**
 * @description: 获取一份新玩家战斗面板
 * @return {Promise<*>} talentInfo对象
 */
export async function GetNewTalentInfo() {
    const talentInfo = {};
    talentInfo.spiritualRoot = randSpiritualRoot();
    talentInfo.spiritualRootName = getSpiritualRootName(talentInfo.spiritualRoot);
    talentInfo.show = false;
    talentInfo.manualList = [];
    talentInfo.buff = getBuff(talentInfo.spiritualRoot, talentInfo.manualList);
    return talentInfo;
}

/******* 
 * @description: 从cache里获取玩家的修炼天赋加成信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<number>} 返回的修炼天赋加成信息 JSON对象
 */
export async function GetTalentBuff(_uid) {
    const talentInfo = await GetTalentInfo(_uid);
    return talentInfo?.buff;
}

/******* 
 * @description: 从cache里获取玩家的灵根信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<[]>} 返回的灵根信息 JSON对象
 */
export async function GetSpiritualRoot(_uid) {
    const talentInfo = await GetTalentInfo(_uid);
    return talentInfo?.spiritualRoot;
}

/******* 
 * @description: 学习新功法
 * @param {string} _uid 玩家id
 * @param {*} _manual 功法对象
 * @return {Promise<boolean>} 返回是否学习成功 true->学习成功
 */
export async function AddManual(_uid, _manual) {
    const talentInfo = await GetTalentInfo(_uid);
    const maxLearnNum = config.GetConfig('game/player.yaml').maxManual;

    if (talentInfo.manualList.find(item => item.name == _manual.name) != undefined || talentInfo.manualList.length >= maxLearnNum) {
        return false;
    }

    talentInfo.manualList.push({
        name: _manual.name,
        buff: _manual.size
    });

    talentInfo.buff += _manual.size;
    await SetTalentInfo(_uid, talentInfo);
    return true;
}

/******* 
 * @description: 忘掉功法
 * @param {string} _uid 玩家id
 * @param {*} _manualName 功法名
 * @return {Promise<boolean>} 返回是否忘掉成功 true->忘掉成功
 */
export async function DelManual(_uid, _manualName) {
    const talentInfo = await GetTalentInfo(_uid);

    const targetManual = talentInfo.manualList.find(item => item.name == _manualName);
    if (targetManual == undefined) {
        return false;
    }

    talentInfo.manualList.splice(talentInfo.manualList.indexOf(targetManual), 1);
    talentInfo.buff -= targetManual.buff;
    await SetTalentInfo(_uid, talentInfo);
    return true;
}

/**
 * @description: 随机生成灵根
 * @return {[]} 灵根数组
 */
function randSpiritualRoot() {
    const spRoot = [];
    const time = rand(1, 11); //尝试次数
    for (let i = 0; i < time; i++) {
        const sr  = rand(1, 11);
        if(-1 != spRoot.indexOf(sr)) continue;
        if(sr <= 5 && -1 != spRoot.indexOf(sr + 5)) continue;
        if(sr > 5 && -1 != spRoot.indexOf(sr - 5)) continue;
        spRoot.push(sr);
    }
    return spRoot;
}

/**
 * @description:  根据灵根数组获取灵根名
 * @param {[]} _spRoot 灵根数组
 * @return {string} 返回灵根名
 */
function getSpiritualRootName(_spRoot){
    let name = "";
    _spRoot.forEach(root => name += data.talentList.find(item => item.id == root).name);
    return name;
}

/**
 * @description: 根据灵根和功法计算修炼效率
 * @param {[]} _spRoot 灵根数组
 * @param {[]} _manualList 功法数组
 * @return {number} 修炼效率
 */
function getBuff(_spRoot, _manualList){
    let buff = 250;
    _spRoot.forEach(root => buff -= (root >= 5 ? 40 : 50));
    _manualList.forEach(manual => buff += manual.buff);
    return buff;
}