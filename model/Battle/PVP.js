import { rand } from "../mathCommon.js";
import { AutoSkillInBattle } from "../Skill/base.js";

/**
 * @description: 1v1 PVP战斗模型
 * @param {Object} _attacker 攻击者 需求 .name .battleInfo
 * @param {Object} _target 目标 需求同上
 * @param {[]} _msg 战斗信息
 * @return {Promise<bool>} 战斗结果， win->true 
 */
export async function _1v1(_attacker, _target, _msg) {
    const C_MAXROUND = 30 + rand(-3, 3); //限制最大回合
    const C_PROCESS = {    //战斗流程
        attack_1v1: counterAttack_1v1,
        counterAttack_1v1: attack_1v1,
    }

    let round = attack_1v1;
    let count = 1;          //记录战斗轮数

    //1. 按轮次发动战斗
    while (count < C_MAXROUND && !await round(_attacker, _target, _msg)) {
        count++;
        round = C_PROCESS[round.name];
    }

    //2. 战斗结束处理结果
    const battleResult = count < C_MAXROUND && _attacker.battleInfo.nowblood > 0;
    _msg.push(`经过${count}回合`);
    _msg.push(battleResult ? `你击败了${_target.name}!` : _attacker.battleInfo.nowblood > 0 ? `${_target.name}一个闪身躲开你的攻击逃跑了！` : `你被${_target.name}击败了！`);
    
    const nowbloodPercent = Math.floor(_attacker.battleInfo.nowblood / _attacker.battleInfo.blood * 100)
    _msg.push(`血量剩余: ${_attacker.battleInfo.nowblood} [${nowbloodPercent}%]`);

    return battleResult;
}

/**
 * @description: 1v1战斗，attacker 攻击 target
 * @param {Object} _attacker 攻击者
 * @param {Object} _target 目标
 * @param {[]} _msg 战斗信息
 * @return {Promise<bool>} 返回战斗是否结束 
 */
async function attack_1v1(_attacker, _target, _msg) {
     //设置一个基础伤害
    const BaseDamage = rand(0, _attacker.battleInfo.blood / 1000);   
    //计算伤害
    let damage = Math.max(_attacker.battleInfo.attack - _target.battleInfo.defense, 0)              
        * (ifBurst(_attacker.battleInfo.burst) ? _attacker.battleInfo.burstmax / 100 : 1);
    damage = Math.floor(damage + BaseDamage);

    _msg.push(`${_attacker.name} 出手...`);
    //玩家检测释放技能
    const extra = (_attacker.uid == undefined) ? -1 : await AutoSkillInBattle(_attacker.uid, [_target], _msg);
    if (extra != -1) {
        damage = Math.floor(damage * (1 + extra / 100));
    }

    //检测玩家闪避
    if(ifDodge(_target.battleInfo.speed)){
        _msg.push(`${_target.name}脚下生风，一个闪身躲了...`);
        damage = 0;
    }

    _msg.push(`对${_target.name}造成${damage}点伤害！！`);
    _target.battleInfo.nowblood = Math.max(0, _target.battleInfo.nowblood - damage);
    return _target.battleInfo.nowblood == 0;
}

/**
 * @description: 1v1战斗，target 攻击 attacker
 */
async function counterAttack_1v1(_attacker, _target, _msg) {
    return await attack_1v1(_target, _attacker, _msg);
}

/**
 * @description: 判断暴击 
 * @param {number} _burstRate 暴击率
 * @return {bool} 是否暴击
 */
function ifBurst(_burstRate) {
    return rand(0, 100) <= _burstRate;
}

/**
 * @description: 判断闪避
 * @param {number} _dodgeRate 闪避率，这里用speed
 * @return {bool} 是否闪避
 */
function ifDodge(_dodgeRate){
    return rand(0, 11) <= Math.log(_dodgeRate + 1);
}
