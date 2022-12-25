//一些通用的数学小函数

/******* 
 * @description: 返回一个[min, max)之间的整数
 * @return {number}
 */
export function rand(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}

/******* 
 * @description: 限制value在[min, max]之间,并返回
 */
export function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
}

/******* 
 * @description: 返回value是否在[min, max]之间
 * @return {boolean}
 */
export function inRange(value, min, max){
    return  value >= min && value <= max;
}