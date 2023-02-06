/******* 
 * @description: 
 *  管理所有丹药方法，主游戏所有丹药方法在Init初始化
 *  插件中丹药方法请在插件GameInit中调用AddPellet()加入
 */
export default class PelletMgr {
    static pellets = {};

    /******* 
     * @description:初始化存储所有丹药方法
     */
    static async Init() {
        PelletMgr.pellets = await import('./pellets.js');
    }

    /******* 
     * @description: 插件调用该方法将插件特有丹药方法加入游戏，注意丹药方法重名时会放弃加入
     * @param {array} lists {[pelletName, pelletFnc], ...}，建议使用 import()
     * @return {number} 返回成功添加方法个数
     */
    static AddPellet(...lists) {
        let cnt = 0;
        lists.forEach(list => {
            for(let key in list){
                if (PelletMgr.pellets[key] != undefined) continue;

                PelletMgr.pellets[key] = list[key];
                cnt++;
            }
        });
        return cnt;
    }
}