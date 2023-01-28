import PropMgr from "./mgr.js";

/******* 
 * @description: 使用道具
 * @param {string} _name 道具名
 * @param {string} _uid 使用者id
 * @param {[]} _msg 发送的信息
 * @return {Promise<boolean>} 是否成功使用道具
 */
export async function UseProp(_name, _uid, _msg) {
    if (PropMgr.props[_name] == undefined) return false;

    try {
        await PropMgr.props[_name](_uid, _msg);
    } catch (error) {
        logger.info(`使用道具${_name}发生错误！\n ${error}`);
        return false;
    }
    return true;
}