import { Read_battle, Read_Life } from "../../apps/Xiuxian/Xiuxian.js";

/******* 
 * @description: 检查有无此人存档
 */
const existPlayer = async (_user) => {
    const life = (await Read_Life()).find(player => player.qq == _user.user_id);
    if (life == undefined) {
        _user.reply("生死簿上查无此人，请先#降临世界！");
        return false;
    };

    if (life.status == 0) {
        _user.reply("你此生寿元已尽，请#再入仙途！");
        return false;
    };

    return true;
}

/******* 
 * @description: 检查是否群中消息
 */
const isGroup = async (_user) => {
    if (!_user.isGroup) {
        _user.reply("该指令必须在多人群中进行！");
        return false;
    }
    return true;
}

/******* 
 * @description: 检查是否在某行动中
 */
const action = async (_user) => {
    const action = await redis.get(`xiuxian:player:${_user.user_id}:action`);
    if (action != undefined) {
        _user.reply((await JSON.parse(action)).actionName + '中...');
        return false;
    };
    return true;
}

/******* 
 * @description: 检查血量是否充足
 */
const blood = async (_user) => {
    if ((await Read_battle(_user.user_id)).nowblood <= 1) {
        _user.reply("血量不足......");
        return false;
    }
    return true;
}

/******* 
 * @description: 需检测内容,为检测该状态等级的func
 *  方法传入plugin的传参e，方法内reply封锁原因，并返回检测结果
 */
const checkList = [
    existPlayer,
    isGroup,
    action,
    blood,
];

/******* 
 * @description: 状态等级
 */
export const StatuLevel = {
    "exist": 0,
    "inGroup": 1,
    "inAction": 2,
    "canBattle": 3,
    "canMove": 3,
    "canGive": 3,
    "canLevelUp": 3,
}

/******* 
 * @description: 根据状态等级逐级检查是否被封锁
 * @param {*} _user plugin参数e
 * @param {number} _statuLevel 状态等级，见上方StatuLevel
 * @return {boolean} 返回状态 false->不可进行 
 */
export async function CheckStatu(_user, _statuLevel) {
    let res = true;
    for (let i = 0; i <= _statuLevel && res; ++i) {
        logger.info(res);
        logger.info(checkList[i]);
        res &= (await checkList[i](_user));

    }
    return res;
}