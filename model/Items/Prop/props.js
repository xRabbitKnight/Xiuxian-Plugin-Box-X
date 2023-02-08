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
    GenerateNewSpiritualRoot, SetTalentOnShow, GetAllSkill
} from "../../Cache";
import { randItem } from "../../util";
import { DelActionCD } from "../../CD/Action.js";
import { DelSkillCD, IfSkillInCD } from "../../CD/Skill.js";

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
        `一股异常灵力波动从「${await GetAreaName(randItem(MonsterMgr.Boss).region)}」传来！` :
        `寻灵尺毫无反应！`
    );
}
 
export async function 千年灵乳(_uid, _targets, _msg) {
    _msg.push('千年灵乳蕴含的灵气瞬间滋润了你的全身各处，技能冷却刷新了！');
    const player = await GetAllSkill(_uid);
    for (let skill of player) {
        if (await IfSkillInCD(_uid, skill.name)){
            DelSkillCD(_uid, skill.name);
        }
    }
}

export async function 双生木(_uid, _targets, _msg) {
    _msg.push('双生木渐渐化作你的模样后突然消散，你全身的疲倦也一并消失，击杀冷却刷新了！');
    DelActionCD(_uid, 'kill');
}