import { rand } from "../mathCommon.js";

/**
 * @description: 1v1战斗模型
 * @param {Object} _attacker 攻击者 需求 .name .battleInfo
 * @param {Object} _target 目标 需求同上
 * @param {[]} _msg 战斗信息
 * @return {boolean} 战斗结果， win->true 
 */
export async function Model_1v1(_attacker, _target, _msg){
    const C_MAXROUND = 50; //限制最大回合
    const C_PROCESS = {    //战斗流程
        raid_1v1 : counterAttack_1v1,
        attack_1v1 : counterAttack_1v1,
        counterAttack_1v1 : attack_1v1,
    };

    let round = raid_1v1; 
    let count = 1;          //记录战斗轮数

    //1. 按轮次发动战斗
    while(count < C_MAXROUND && !await round(_attacker, _target, _msg)){
        count++;
        round = C_PROCESS[round.name];
    }

    //2. 战斗结束处理结果
    const battleResult = count < C_MAXROUND && _attacker.battleInfo.nowblood > 0;
    _msg.push(`经过${count}回合`);
    _msg.push(battleResult ? `你击败了${_target.name}!` : `你被${_target.name}击败了！`);
    _msg.push(`血量剩余: ${_attacker.battleInfo.nowblood}.`);

    return battleResult;
};

/**
 * @description: 1v1战斗，attacker 偷袭 target
 * @param {Object} _attacker 攻击者
 * @param {Object} _target 目标
 * @param {[]} _msg 战斗信息
 * @return {bool} 返回战斗是否结束 
 */
async function raid_1v1(_attacker, _target, _msg){
    //偷袭失败
    if(!ifRaidSuc(_attacker, _target)){
        _msg.push(`你个老六想偷袭,${_target.name}一个转身就躲过去了`);
        return false;
    }

    //偷袭成功
    const C_RAID_EXTRA_RATE = 1.1; //偷袭额外伤害倍率
    let damage = Math.floor(Math.max(_attacker.battleInfo.attack - _target.battleInfo.defense, 0)              //计算伤害
                * (ifBurst(_attacker.battleInfo.burst)? _attacker.battleInfo.burstmax / 100 : 1) 
                * C_RAID_EXTRA_RATE);
    
    //mio杀
    if(damage >= _target.battleInfo.nowblood){ 
        _msg.push(`你个老六偷袭,仅出一招,就击败了${_target.name}!`);
        _target.battleInfo.nowblood = 0;
        return true;
    }

    //被mio杀
    if(damage <= 0){
        _msg.push(`你个老六想偷袭,却连${_target.name}的防御都破不了,被一巴掌给拍死了!`);
        _attacker.battleInfo.nowblood = 0;
        return true;
    }

    _msg.push(`你个老六偷袭,造成${damage}伤害!`);
    _target.battleInfo.nowblood -= damage;
    return false;
};

/**
 * @description: 1v1战斗，attacker 攻击 target
 * @param {Object} _attacker 攻击者
 * @param {Object} _target 目标
 * @param {[]} _msg 战斗信息
 * @return {bool} 返回战斗是否结束 
 */
async function attack_1v1(_attacker, _target, _msg){
    let damage = Math.floor(Math.max(_attacker.battleInfo.attack - _target.battleInfo.defense, 0)              //计算伤害
                * (ifBurst(_attacker.battleInfo.burst)? _attacker.battleInfo.burstmax / 100 : 1));

    _target.battleInfo.nowblood = Math.max(0, _target.battleInfo.nowblood - damage);
    //_msg.push(`${_attacker.name} 攻击 ${_target.name}, 造成${damage}伤害, ${_target.name} 剩${_target.battleInfo.nowblood}血.`);
    return _target.battleInfo.nowblood == 0;
};

/**
 * @description: 1v1战斗，target 攻击 attacker
 */
async function counterAttack_1v1(_attacker, _target, _msg){
    return attack_1v1(_target, _attacker, _msg);
};

/**
 * @description: 判断暴击 
 * @param {Number} _burstRate 暴击率
 * @return {bool} 是否暴击
 */
function ifBurst(_burstRate){
    return rand(0, 100) <= _burstRate;
}

/**
 * @description: 判断是否偷袭成功
 * @param {Object} _attacker
 * @param {Object} _target
 * @return {bool} 偷袭结果
 */
function ifRaidSuc(_attacker, _target){
    // 偷袭者speed不能比目标低超过5，否则偷袭失败
    const C_RAID_SPEED = 5; 
    return _attacker.battleInfo.speed > _target.battleInfo.speed - 5;
}

