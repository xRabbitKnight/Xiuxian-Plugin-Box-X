import * as CD from './base.js';
import config from '../System/config.js';
import { secondToHour } from '../util';

const redisKeyPre = 'xiuxian:player';

/******* 
 * @description: 给玩家的行为设置cd
 * @param {string} _uid 玩家id
 * @param {string} _actionName 行为名
 * @return 无返回值
 */
export function AddActionCD(_uid, _actionName) {
    const time = config.GetConfig('game/cd.yaml')['action'][_actionName];
    if (time == undefined) {
        logger.warn(`config中未定义${_actionName}CD时间！`);
        return;
    }
    CD.AddCD(`${redisKeyPre}:${_uid}:${_actionName}`, time);
}

/******* 
 * @description: 删除玩家行为的cd
 * @param {string} _uid 玩家id
 * @param {string} _actionName 行为名
 * @return 无返回值
 */
export function DelActionCD(_uid, _actionName) {
    const time = config.GetConfig('game/cd.yaml')['action'][_actionName];
    if (time == undefined) {
        logger.warn(`config中未定义行为${_actionName}！`);
        return;
    }
    CD.DelCD(`${redisKeyPre}:${_uid}:${_actionName}`);
}

/******* 
 * @description: 查询玩家某行为是否处在cd中
 * @param {string} _uid 玩家id
 * @param {string} _actionName 行为名
 * @param {Function} _msg 输出方法，输出剩余cd时间，不填则无输出
 * @return {Promise<bool>} true -> 冷却中
 */
export async function IfActionInCD(_uid, _actionName, _msg = undefined) {
    const time = await CD.GetCD(`${redisKeyPre}:${_uid}:${_actionName}`);
    if (_msg != undefined && time > 0) _msg(`冷却时间: ${secondToHour(time)}`);
    return time > 0;
}