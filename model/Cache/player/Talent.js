import config from '../../System/config.js';
import data from '../../System/data.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:talentInfo";
const PATH = data.__gameDataPath.talent;

/******* 
 * @description: 从cache里获取玩家的天赋信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的TalentInfo JSON对象
 */
export async function GetTalentInfo(_uid) {
    return GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家天赋信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _talentInfo 玩家天赋信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetTalentInfo(_uid, _talentInfo) {
    SetInfo(_uid, _talentInfo, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 从cache里获取玩家的修炼天赋加成信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<number>} 返回的TalentInfo JSON对象
 */
export async function GetTalentBuff(_uid){
    const talentInfo = await GetTalentInfo(_uid);
    return talentInfo?.talentsize;
}

/******* 
 * @description: 学习新功法
 * @param {string} _uid 玩家id
 * @param {*} _manual 功法对象
 * @return {Promise<boolean>} 返回是否学习成功 true->学习成功
 */
export async function AddManual(_uid, _manual){
    const talentInfo = await GetTalentInfo(_uid);
    const maxLearnNum = config.GetConfig('game/player.yaml').maxManual;

    if(talentInfo.AllSorcery.find(item => item.id == _manual.id) != undefined || talentInfo.AllSorcery.length >= maxLearnNum){
        return false;
    }

    talentInfo.AllSorcery.push(_manual);
    talentInfo.talentsize += _manual.size;
    SetTalentInfo(_uid, talentInfo);
    return true;
}

/******* 
 * @description: 忘掉功法
 * @param {string} _uid 玩家id
 * @param {*} _manualName 功法名
 * @return {Promise<boolean>} 返回是否忘掉成功 true->忘掉成功
 */
 export async function DelManual(_uid, _manualName){
    const talentInfo = await GetTalentInfo(_uid);

    const targetManual = talentInfo.AllSorcery.find(item => item.name == _manualName);
    if(targetManual == undefined){
        return false;
    }

    talentInfo.AllSorcery = talentInfo.AllSorcery.filter(item => item != targetManual);
    talentInfo.talentsize -= targetManual.size;
    SetTalentInfo(_uid, talentInfo);
    return true;
}