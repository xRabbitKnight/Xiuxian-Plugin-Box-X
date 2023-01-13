import asyncLock from "async-lock";

const aLock = new asyncLock();

/******* 
 * @description: 异步执行锁，在修改相关临界资源的时候请上锁防止覆盖
 * @param {string} _key 需上锁的key
 * @param {function} _fnc 执行函数
 * @return 无返回值
 */
export async function lock(_key, _fnc) {
    if (_key == undefined || _fnc == undefined) return;

    try {
        aLock.acquire(
            //锁定的key
            `${_key}`,
            //需要执行的方法，注意这个done是执行完毕的callback(即下个参数的函数)，同时调用done会解锁key
            async function (done) {
                await _fnc();
                done();
            },
            //执行方法完成后的callback，可以用于处理结果或者错误
            async function (err, ret) { 

            },
            //acquire的option，详见 https://github.com/rogierschouten/async-lock
            {}
        );
    } catch (err) {
        logger.error(err);
        return;
    }
}