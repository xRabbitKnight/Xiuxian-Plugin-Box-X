//一些通用的数学小函数

/******* 
 * @description: 返回一个[min, max)之间的整数
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