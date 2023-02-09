import data from '../../System/data.js';
import path from 'path';
import { lock } from '../base.js';
import { GetInfo, SetInfo } from './InfoCache.js';
import { GetSpiritualRoot } from './Talent.js';
import { GetItemObj } from '../item/Item.js';

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
            power: getSkillPower(_skillBook, await GetSpiritualRoot(_uid))
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

/******* 
 * @description: 刷新玩家所有技能倍率
 * @param {number} _uid 玩家id
 * @return 无返回值
 */
export async function RefreshSkill(_uid) {
    lock(`${redisKey}:${_uid}`, async () => {
        const skillInfo = await getSkillInfo(_uid);
        const spRoots = await GetSpiritualRoot(_uid);
        if (skillInfo == undefined || spRoots == undefined) return;

        for (let skill of skillInfo.skillList) {
            const skillBook = await GetItemObj({ name: `技能书：${skill.name}` });
            if (skillBook == undefined) {
                logger.error(`更新技能${skill.name}失败!`);
                continue;
            }

            skill.power = getSkillPower(skillBook, spRoots);
        }

        await setSkillInfo(_uid, skillInfo);
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
 * @param {any} _skillBook 技能书对象
 * @param {any} _spRoots 玩家灵根信息
 * @return {number} 技能倍率
 */
function getSkillPower(_skillBook, _spRoots) {
    //基础倍率
    let power = _skillBook.power;

    //每多一种符合属性的灵根 +20倍率， 多一种不合属性的 -10倍率
    _spRoots.forEach(spRoot => {
        const result = _skillBook.spiritualRoot.find(root => spRoot == root);
        power += (result == undefined ? -10 : 20);
    });

    return power;
}

//#endregion