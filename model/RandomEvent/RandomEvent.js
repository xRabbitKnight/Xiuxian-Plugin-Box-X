export default class RandomEvent{
    /******* 
     * @description: 随机事件类
     * @param odds 事件触发概率（0~1）
     * @param fnc 事件触发执行方法
     */
    constructor(_data){
        this.odds = _data.odds,
        this.fnc = _data.fnc
    }
}