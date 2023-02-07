/**-----------------------------------------------
 @description: 
    随机事件实现
    事件方法请统一格式如下
 @example
    // data中一般包含玩家uid，其余需求信息可自行配置
    export function xxx(data){
        ...
        return new XiuxianMsg(...);
    }
 -----------------------------------------------*/

export default class RandomEvent{
    /******* 
     * @description: 随机事件类
     * @param {number} odds 事件触发概率（0~1）
     * @param {Function} fnc 事件触发执行方法
     */
    constructor(data){
        this.odds = data.odds,
        this.fnc = data.fnc
    }
}