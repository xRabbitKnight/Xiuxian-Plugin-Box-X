/**-----------------------------------------------
 description: 敏感词检测
 -----------------------------------------------**/

import Mint from 'mint-filter';

const WordList = ['尼玛', '妈的', '他妈', '卧槽', '操', '操蛋', '麻痹', '傻逼', '妈逼'];
const filter = new Mint.default(WordList);

/******* 
 * @description: 检测敏感词
 * @param {string} _sentence 待检测字符串
 * @return {boolean} 检测到敏感词返回true
 */
export function CheckSensitiveWord(_sentence){
    return !filter.validator(_sentence);
}