/**-----------------------------------------------
 description: 
    一些通用工具
 -----------------------------------------------**/


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