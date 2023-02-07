/**-----------------------------------------------
 description: 
    道具主动使用方法实现, 模板如下, 传入为使用道具的玩家id, 暂无返回值
    方法名暂定为道具名, 方便调用
    export async function xxx(_uid, _targets, _msg){
        xxx功能
    }
 -----------------------------------------------**/

import MonsterMgr from "../../Monster/mgr.js";
import {
    GetAreaName,
    RefreshSkill,
    GenerateNewSpiritualRoot, SetTalentOnShow
} from "../../Cache";
import { randItem } from "../../util";

export async function 望灵珠(_uid, _targets, _msg) {
    _msg.push('透过神秘的玉珠，你观察到了自己的天赋！');
    SetTalentOnShow(_uid, true);
}

export async function 洗根水(_uid, _targets, _msg) {
    _msg.push('一股神秘的力量冲刷过你的身体，你的天赋似乎发生了一些变化！');
    GenerateNewSpiritualRoot(_uid);
    RefreshSkill(_uid);
}

export async function 寻灵尺(_uid, _targets, _msg) {
    _msg.push(MonsterMgr.Boss.length > 0 ?
        `一股异常灵力波动从${await GetAreaName(randItem(MonsterMgr.Boss).region)}传来！` :
        `寻灵尺毫无反应！`
    );
}