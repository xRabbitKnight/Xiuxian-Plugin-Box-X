import Config from "../Config.js";

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

export function GetActionCDTime(_ActionName){
    const cd = (new CD()).ActionCDTime[_ActionName];
    if(cd == undefined){
        logger.error(`获取cd错误，Config中无${_ActionName}定义！`)
        return -1;
    }
    return cd;
}