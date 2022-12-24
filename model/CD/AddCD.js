import { GetActionCDTime } from "./CD.js";

/******* 
 * @description: 根据actionName添加cd
 * @param {*} _e 玩家，plugin参数e
 * @param {string} _actionName 需要添加的行为名，见 config/xiuxian/xiuxian.yaml
 */
export async function AddActionCD(_e, _actionName){
    const time = GetActionCDTime(_actionName);
    if(time != -1){
        await redis.set(`xiuxian:player:${_e.user_id}:${_actionName}`, new Date().getTime());
        await redis.expire(`xiuxian:player:${_e.user_id}:${_actionName}`, time * 60);
    } 
}