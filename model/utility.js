/**-----------------------------------------------
 description: 
    一些通用工具
 -----------------------------------------------**/

import { forceNumber } from "./mathCommon.js";


/******* 
 * @description: 将秒转化成1h1m1s的形态
 * @param {number} _second
 * @return {string} 转换后
 */
export function secondToHour(_second) {
    if (_second <= 0) return "";

    const h = Math.floor(_second / 3600);
    const m = Math.floor((_second % 3600) / 60);
    const s = _second % 60;
    return (h > 0 ? `${h}h` : '') + (m > 0 ? `${m}m` : '') + (s > 0 ? `${s}s` : '');
}

/******* 
 * @description: 比较两个物品id, 作为sort升序排列方法
 * @param {string} _id1 id1
 * @param {string} _id2 id2
 * @return {number} -1, 0, 1
 */
export function compareByIdAsc(_id1, _id2){
    const id1 = _id1.split('-');
    const id2 = _id2.split('-');
    const cnt = Math.min(id1.length, id2.length);
    for(let i = 0; i < cnt; ++i){
        if(id1[i] == id2[i]) continue;
        return forceNumber(id1[i]) - forceNumber(id2[i]);
    }
    return 0;
}

/******* 
 * @description: 解析消息并返回被at的uid（qq）, at多人只返回第一个at的uid
 * @param {*} _e plugin参数e
 * @return {number} uid号，解析失败返回undefined
 */
export function getAtUid(_e){
    const elem = _e.message.filter(msg => msg.type === 'at');
    if(elem.length <= 0) return undefined;
    return elem[0].qq;
}

export async function replyForwardMsg(_e, _msg){
    
}