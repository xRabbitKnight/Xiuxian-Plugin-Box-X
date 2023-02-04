import { GetItemReg } from "../../Cache/item/Item.js";
import { forceNumber } from "../../util/math.js";
import PelletMgr from "./mgr.js";

/******* 
 * @description: 服用丹药
 * @param {any} _pellet 丹药对象
 * @param {string} _uid 使用者id
 * @param {[]} _msg 发送的信息
 * @param {number} _count 丹药服用数量 默认为1
 * @return {Promise<boolean>} 是否成功服用丹药
 */
export async function ConsumePellet(_uid, _pellet, _msg, _count = 1) {
    const fnc = getPelletFnc(_pellet);
    if (fnc == undefined) return false;

    try {
        await fnc(_uid, _pellet, forceNumber(_count), _msg);
    } catch (error) {
        logger.info(`服用丹药${_pellet.name}发生错误！\n ${error}`);
        return false;
    }
    return true;
}


/******* 
 * @description: 获取丹药需执行的对应方法
 * @param {any} _pellet 丹药对象
 * @return {Function} 对应方法， 没有获取到返回undefined 
 */
function getPelletFnc(_pellet) {
    //处理几个大类丹药
    const preSet = [
        '恢复药', '修为药', '气血药'
    ];

    for (let type of preSet) {
        if (GetItemReg(type).test(_pellet.id)) {
            return PelletMgr.pellets[type];
        }
    }

    //特殊丹药使用单独方法处理
    return PelletMgr.pellets[_pellet.name];
}