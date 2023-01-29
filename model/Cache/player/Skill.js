import data from '../../System/data.js';
import path from 'path';
import { GetInfo, SetInfo } from './InfoCache.js';
import { GetSpiritualRoot } from './Talent.js';

const redisKey = data.__gameDataKey.skill;
const PATH = data.__gameDataPath.skill;

//#region Get方法

/******* 
 * @description: 获取玩家的技能信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 技能信息
 */
export async function GetSkill(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getSkillInfo(_uid);
    });
}

/******* 
 * @description: 获取玩家所有技能
 * @param {number} _uid 玩家id
 * @return {Promise<[]>} 所有技能
 */
export async function GetAllSkill(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const skillInfo = await getSkillInfo(_uid);
        return skillInfo?.skillList;
    });
}

/******* 
 * @description: 学习新技能
 * @param {number} _uid 玩家id
 * @param {any} _skillBook 技能书对象
 * @return {Promise<boolean>} 返回是否学习成功 true->学习成功
 */
export async function AddSkill(_uid, _skillBook) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const skillInfo = await getSkillInfo(_uid);

        const name = _skillBook.name.replace("技能书：", "");
        if (skillInfo == undefined || skillInfo.skillList.find(skill => skill.name == name) != undefined) {
            return false;
        }

        skillInfo.skillList.push({
            name: name,
            power: await getSkillPower(_uid, _skillBook)
        });
        await setSkillInfo(_uid, skillInfo);
        return true;
    });
}

/******* 
 * @description: 忘掉技能
 * @param {number} _uid 玩家id
 * @param {string} _skillName 技能名
 * @return {Promise<boolean>} 返回是否忘掉成功 true->忘掉成功
 */
export async function DelSkill(_uid, _skillName) {

    return lock(`${redisKey}:${_uid}`, async () => {
        const skillInfo = await getSkillInfo(_uid);

        const targetSkill = skillInfo.skillList.find(skill => skill.name == _skillName);
        if (targetSkill == undefined) {
            return false;
        }

        skillInfo.skillList.splice(skillInfo.skillList.indexOf(targetSkill), 1);
        await setSkillInfo(_uid, skillInfo);
        return true;
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 更新玩家技能信息, 并写入数据
 * @param {number} _uid 玩家id
 * @param {any} _talentInfo 玩家技能信息
 * @return 无返回值
 */
export async function SetSkill(_uid, _skillInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setSkillInfo(_uid, _skillInfo);
    });
}

//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的技能信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 技能信息
 */
export async function getSkillInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 更新玩家技能信息, 并写入数据
 * @param {number} _uid 玩家id
 * @param {any} _talentInfo 玩家技能信息
 * @return 无返回值
 */
export async function setSkillInfo(_uid, _skillInfo) {
    await SetInfo(_uid, _skillInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 根据玩家灵根以及对应技能计算玩家该技能倍率
 * @param {number} _uid 玩家id
 * @param {any} _skillBook 技能书对象
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

//#endregion