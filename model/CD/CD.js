import Config from "../Config.js";

/******* 
 * @description: 读取config中cd配置
 */
class CD {
    constructor() {
        if (!CD.instance) {
            CD.instance = this;
            this.ActionCDTime = Config.getConfig('xiuxian', 'xiuxian').CD;
        }
        return CD.instance;
    }
}
export default new CD();

/******* 
 * @description: 根据actionName获取对应cd时间
 * @param {string} _ActionName
 * @return {number} 返回对应的cd时间，若actionName不存在返回-1
 */
export function GetActionCDTime(_ActionName){
    const cd = (new CD()).ActionCDTime[_ActionName];
    if(cd == undefined){
        logger.error(`获取cd错误，Config中无${_ActionName}定义！`)
        return -1;
    }
    return cd;
}