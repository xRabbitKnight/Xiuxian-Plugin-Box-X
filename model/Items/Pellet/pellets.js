/**-----------------------------------------------
 @description: 
    丹药服用方法实现, 模板如下
    特殊丹药方法名暂定为丹药名, 方便调用

 @example
    // _uid 玩家id
    // _pellet 丹药对象
    // _msg 效果消息
    // _count 丹药数量
    export async function xxx(_uid, _pellet, _count, _msg){
        xxx功能
    }
 -----------------------------------------------*/

import { clamp } from "../../util";
import {
    AddPercentBlood,
    AddExp, AddBodyExp
} from "../../Cache";

export async function 恢复药(_uid, _pellet, _count, _msg) {
    AddPercentBlood(_uid, _pellet.blood * _count);
    _msg.push(`血量恢复${clamp(_pellet.blood * _count, 1, 100)}%`);
}

export async function 修为药(_uid, _pellet, _count, _msg) {
    AddExp(_uid, _pellet.experience * _count);
    _msg.push(`修为增加${_pellet.experience * _count}.`);
}

export async function 气血药(_uid, _pellet, _count, _msg) {
    AddBodyExp(_uid, _pellet.experiencemax * _count);
    _msg.push(`气血增加${_pellet.experiencemax * _count}.`);
}