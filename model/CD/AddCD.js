import { GetActionCDTime } from "./CD.js";

export async function AddActionCD(_e, _actionName){
    const time = GetActionCDTime(_actionName);
    if(time != -1){
        await redis.set(`xiuxian:player:${_e.user_id}:${_actionName}`, new Date().getTime());
        await redis.expire(`xiuxian:player:${_e.user_id}:${_actionName}`, time * 60);
    } 
}