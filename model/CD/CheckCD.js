/******* 
 * @description: 检查是否处于冷却中
 * @param {*} _e 玩家,plugin参数e
 * @param {string} _CDName 检查行为名字
 * @param {boolean} _reply 是否回复cd时间, 默认回复
 * @return {boolean} 返回是否处于冷却中, true->冷却中
 */
export async function CheckCD(_e, _CDName, _reply = true){
    const cd = await redis.ttl(`xiuxian:player:${_e.user_id}:${_CDName}`); //ttl返回值 参考：https://redis.io/commands/ttl/
    
    if(cd > 0){                             
        let hh = Math.floor(cd / 3600);
        let mm = Math.floor((cd % 3600) / 60);
        let ss = cd % 60;

        let msg = `冷却时间: `;
        if(hh > 0) msg += `${hh}h`;
        if(mm > 0) msg += `${mm}m`;
        if(ss > 0) msg += `${ss}s`;
        if(_reply) _e.reply(msg);
        return true;
    } 

    return false;
}