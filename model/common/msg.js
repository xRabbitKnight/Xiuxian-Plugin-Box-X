/******* 
* @param {boolean} result 执行结果，选填，默认为true
* @param {string[]} msg 返回消息，选填，默认空字符串数组
* @param {any} ... 其余信息可自行添加定义
*/
export default class XiuxianMsg {
    constructor(data = {}) {
        this.result = true;
        this.msg = [];

        Object.keys(data).forEach(key => this[key] = data[key]);
    }
}