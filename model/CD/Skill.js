import * as CD from './base.js';
import config from '../System/config.js';
import { secondToHour } from '../util';

const redisKeyPre = 'xiuxian:skill';

/******* 
 * @description: 给玩家的技能设置cd
 * @param {string} _uid 玩家id
 * @param {string} _skillName 技能名
 * @return 无返回值
 */
export function AddSkillCD(_uid, _skillName) {
    const time = config.GetConfig('game/cd.yaml')['skill'][_skillName];
    if (time == undefined) {
        logger.warn(`config中未定义${_skillName}CD时间！`);
        return;
    }
    CD.AddCD(`${redisKeyPre}:${_uid}:${_skillName}`, time);
}


/******* 
 * @description: 查询玩家某技能是否处在cd中
 * @param {string} _uid 玩家id
 * @param {string} _skillName 技能名
 * @param {Function} _msg 输出方法，输出剩余cd时间，不填则无输出
 * @return {Promise<bool>} true -> 冷却中
 */
export async function IfSkillInCD(_uid, _skillName, _msg = undefined) {
    const time = await CD.GetCD(`${redisKeyPre}:${_uid}:${_skillName}`);
    if (_msg != undefined && time > 0) _msg(`冷却时间: ${secondToHour(time)}`);
    return time > 0;
}