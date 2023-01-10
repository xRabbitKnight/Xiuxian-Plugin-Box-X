import * as CD from '../CD/Skill.js';
import * as skills from './skills.js';
import { GetAllSkill } from '../Cache/player/Skill.js';

/******* 
 * @description: 施放技能
 * @param {string} _name 技能名
 * @param {string} _uid 施放玩家id
 * @param {[]} _targets 被波及到的所有对象
 * @param {[]} _msg 发送的信息
 * @return {Promise<bool>} 技能是否成功释放
 */
export async function UseSkill(_name, _uid, _targets, _msg) {
    if (skills[_name] == undefined) return false;
    try {
        await skills[_name](_uid, _targets, _msg);
    } catch (error) {
        logger.info(`施放技能${_name}发生错误！\n ${error}`);
        return false;
    }
    return true;
}

/******* 
 * @description: 战斗时自动释放技能
 * @param {string} _uid 玩家id
 * @param {[]} _targets 攻击目标
 * @param {[]} _msg 发送信息
 * @return {Promise<number>} 本次技能额外百分比倍率， -1为未释放技能
 */
export async function AutoSkillInBattle(_uid, _targets, _msg) {
    const player = await GetAllSkill(_uid);
    for (let skill of player) {
        //检查技能冷却
        if (await CD.IfSkillInCD(_uid, skill.name)) continue;

        if (await UseSkill(skill.name, _uid, _targets, _msg)) {
            CD.AddSkillCD(_uid, skill.name);
            return skill.power;
        }
    }
    return -1;
}
