import asyncLock from "async-lock";

const aLock = new asyncLock();

/******* 
 * @description: 异步执行锁，在修改相关临界资源的时候请上锁防止覆盖
 * @param {string} _key 需上锁的key
 * @param {function} _fnc 执行函数
 * @return {Promise<any>} _fnc返回内容 发生错误返回null
 */
export async function lock(_key, _fnc) {
    if (_key == undefined || _fnc == undefined) return;

    try {
        return await aLock.acquire(_key, _fnc);
    } catch (err) {
        logger.error(err);
        return undefined;
    }
}