/**-----------------------------------------------
 description: 
    一些通用工具
 -----------------------------------------------**/

import { rand } from "./math.js";

/******* 
 * @description: 将秒转化成1h1m1s的形态
 * @param {number} _second
 * @return {string} 转换后
 */
export function secondToHour(_second) {
   if (_second <= 0) return "";

   const h = Math.floor(_second / 3600);
   const m = Math.floor((_second % 3600) / 60);
   const s = _second % 60;
   return (h > 0 ? `${h}h` : '') + (m > 0 ? `${m}m` : '') + (s > 0 ? `${s}s` : '');
}


/******* 
 * @description: 随机返回数组中一个元素
 * @param {[]} _array 目标数组
 * @return {*} 数组中元素
 */
export function randItem(_array) {
   if (!Array.isArray(_array) || _array.length == 0) return;

   return _array[rand(0, _array.length)];
}