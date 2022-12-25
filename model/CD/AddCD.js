import { GetActionCDTime } from "./CD.js";

/******* 
 * @description: 根据actionName添加cd
 * @param {*} _e 玩家，plugin参数e
 * @param {string} _actionName 需要添加的行为名，见 config/xiuxian/xiuxian.yaml
 */
export async function AddActionCD(_e, _actionName){
    const time = GetActionCDTime(_actionName);
    if(time != -1){
        //注意setEx参数要求 (string, number(int), string) 否则报错
        await redis.setEx(`xiuxian:player:${_e.user_id}:${_actionName}`, time * 60, `${new Date().getTime()}`);
    } 
}