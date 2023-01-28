/******* 
 * @description: 
 *  管理所有道具方法，主游戏所有道具方法在Init初始化
 *  插件中道具方法请在插件GameInit中调用AddProp()加入
 */
export default class PropMgr {
    constructor() {
        if (!PropMgr.instance) PropMgr.instance = this;
        return PropMgr.instance;
    }

    static props = {};

    /******* 
     * @description:初始化存储所有道具方法
     */
    static async Init() {
        PropMgr.props = await import('./props.js');
    }

    /******* 
     * @description: 插件调用该方法将插件特有道具方法加入游戏，注意道具方法重名时会放弃加入
     * @param {array} props 键值对数组 [propName, propFnc]，建议使用 import() 然后...解包 
     * @return {number} 返回成功添加方法个数
     */    
    static AddProp(...props) {
        let cnt = 0;
        props.forEach(prop => {
            if(PropMgr.props[Object.keys(prop)[0]] == undefined){
                Object.assign(PropMgr.props, prop);
                cnt++;
            }
        });
        return cnt;
    }
}