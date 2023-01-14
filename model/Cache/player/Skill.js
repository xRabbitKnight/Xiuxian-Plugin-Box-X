import data from '../../System/data.js';
import path from 'path';
import { GetInfo, SetInfo } from './InfoCache.js';
import { GetSpiritualRoot } from './Talent.js';

const redisKey = data.__gameDataKey.skill;
const PATH = data.__gameDataPath.skill;

/******* 
 * @description: 从cache里获取玩家的技能信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的skillInfo JSON对象
 */
export async function GetSkillInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家技能信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _talentInfo 玩家技能信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetSkillInfo(_uid, _skillInfo) {
    await SetInfo(_uid, _skillInfo, redisKey);
}


/******* 
 * @description: 获取玩家所有技能信息
 * @param {string} _uid 玩家id
 * @return {Promise<[]>} 所有技能
 */
export async function GetAllSkill(_uid) {
    return (await GetSkillInfo(_uid))?.skillList;
}

/******* 
 * @description: 学习新技能
 * @param {string} _uid 玩家id
 * @param {*} _skill 技能对象
 * @return {Promise<boolean>} 返回是否学习成功 true->学习成功
 */
export async function AddSkill(_uid, _skill) {
    const skillInfo = await GetSkillInfo(_uid);

    const name = _skill.name.replace("技能书：", "");
    if (skillInfo == undefined || skillInfo.skillList.find(skill => skill.name == name) != undefined) {
        return false;
    }

    skillInfo.skillList.push({
        name: name,
        power: await getSkillPower(_uid, _skill)
    });
    await SetSkillInfo(_uid, skillInfo);
    return true;
}

/******* 
 * @description: 忘掉技能
 * @param {string} _uid 玩家id
 * @param {*} _skillName 功法名
 * @return {Promise<boolean>} 返回是否忘掉成功 true->忘掉成功
 */
export async function DelSkill(_uid, _skillName) {
    const skillInfo = await GetSkillInfo(_uid);

    const targetSkill = skillInfo.skillList.find(skill => skill.name == _skillName);
    if (targetSkill == undefined) {
        return false;
    }

    skillInfo.skillList.splice(skillInfo.skillList.indexOf(targetSkill), 1);
    await SetSkillInfo(_uid, skillInfo);
    return true;
}


/******* 
 * @description: 根据玩家灵根以及对应技能计算玩家该技能倍率
 * @param {string} _uid 玩家id
 * @param {*} _skill 技能
 * @return {Promise<number>} 技能倍率
 */
async function getSkillPower(_uid, _skill) {
    //基础倍率
    let power = _skill.power;

    //每多一种符合属性的灵根 +20倍率， 多一种不合属性的 -10倍率
    const spiritualRoots = await GetSpiritualRoot(_uid);
    spiritualRoots.forEach(spiritualRoot => {
        const result = _skill.spiritualRoot.find(root => spiritualRoot == root);
        power += (result == undefined ? -10 : 20);
    });

    return power;
}