import XiuxianMsg from '../common/msg.js';
import RandomEvent from './base.js';


/** 不同类别随机事件集 */
const Events = {};

export default class EventMgr {

    /******* 
     * @description: 初始化随机事件管理器
     * @return 无返回值
     */
    static async Init() {
        Events.battleVictory = Object.values(await import('./events_battleVictory.js'));
        sortEvent('battleVictory');
    }

    /******* 
     * @description: 插件向随机事件集合中添加事件，请在GameInit中调用
     * @param {string} _type 事件类别，eg. 战斗胜利后事件battleVictory，或自定义类别
     * @param {RandomEvent[]} _events 所有事件fnc数组
     * @return 无返回值
     */    
    static AddEvents(_type, _events) {
        if(_type == undefined){
            logger.warn(`插件初始化添加event，事件类别undefined!`);
            return;
        }

        if(!Array.isArray(_events)){
            logger.warn(`插件初始化添加event，事件对象数组错误!`);
            return;
        }

        if(Events[_type] == undefined) Events[_type] = [];
        Events[_type].push(...Object.values(_events));
        sortEvent(_type);
    }

    /******* 
     * @description: 随机触发至多n次事件
     * @param {string} _type 需执行事件类型 eg. 战斗胜利后事件battleVictory， 详细参考上方Events
     * @param {any} _data 执行事件需要的参数
     * @param {number} _count 事件触发次数上限，默认为1
     * @return {Promise<XiuxianMsg>} 执行结果 执行发生错误时result为false
     */
    static async TriggerEvent(_type, _data, _count = 1) {
        if (_type == undefined || Events[_type] == undefined) {
            logger.error(`事件类型${_type}未定义！`);
            return new XiuxianMsg({ result: false });
        }

        for (let i = 0, done = 0; i < Events[_type].length && done < _count; ++i) {
            const event = Events[_type][i], msgs = [];
            if (Math.random() > event.odds) continue;

            try {
                const { result, msg } = await event.fnc(_data);
                if (!result) continue;
                msgs.push(...msg);
                done++;
            } catch (error) {
                logger.error(`${_type}类型：随机事件${event.name}执行发生错误！\n ${error.stack}`);
                return new XiuxianMsg({ result: false });
            }

            return new XiuxianMsg({ msg: msgs });
        }
    }
}

/******* 
 * @description: 事件排序，概率低的优先触发
 * @param {string} _type 事件类型
 * @return 无返回值
 */
function sortEvent(_type) {
    Events[_type].sort((a, b) => a.odds - b.odds);
}