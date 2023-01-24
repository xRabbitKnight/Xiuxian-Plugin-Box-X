/**-----------------------------------------------
 description: 
    一些通用的数学小函数
 -----------------------------------------------**/

/******* 
 * @description: 返回一个[min, max)之间的整数
 * @return {number}
 */
export function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/******* 
 * @description: 限制value在[min, max]之间,并返回
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/******* 
 * @description: 返回value是否在[min, max]之间
 * @return {boolean}
 */
export function inRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * @description: 强制修正数据为int，不合法数据修正为1
 * @param {*} value 输入数据
 * @return {number} 修正后数据
 */
export function forceNumber(value) {
    let num = Number(value);
    if (isNaN(parseFloat(num)) && !isFinite(num)) {
        num = 1;
    }
    return Math.floor(num);
}