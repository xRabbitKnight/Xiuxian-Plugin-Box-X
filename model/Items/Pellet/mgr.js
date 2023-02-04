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
     * @param {array} pellet 键值对数组 [pelletName, pelletFnc]，建议使用 import() 然后...解包 
     * @return {number} 返回成功添加方法个数
     */
    static AddPellet(...pellets) {
        let cnt = 0;
        pellets.forEach(pellet => {
            if (PelletMgr.pellets[Object.keys(pellet)[0]] == undefined) {
                Object.assign(PelletMgr.pellets, pellet);
                cnt++;
            }
        });
        return cnt;
    }
}