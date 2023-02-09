import data from '../../System/data.js';
import path from 'path';
import { clamp, forceNumber, lock } from '../../util';
import { GetEquipment } from './Equipment.js';
import { GetInfo, SetInfo } from './InfoCache.js';
import config from '../../System/config.js';

const redisKey = data.__gameDataKey.battle;
const PATH = data.__gameDataPath.battle;

const allAttrs = ['attack', 'defense', 'blood', 'burst', 'burstmax', 'speed'];

//#region Get方法 

/******* 
 * @description: 从cache里获取玩家的战斗面板信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 战斗面板信息
 */
export async function GetBattle(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        return await getBattleInfo(_uid);
    });
}

/**
 * @description: 获取一份新玩家战斗面板
 * @return {Promise<any>} battleInfo对象
 */
export async function GetNewBattle() {
    const battleInfo = { power: 0, base: {} };
    const cfg = config.GetConfig(['game', 'player.yaml']);
    for (let attr of allAttrs) {
        battleInfo.base[attr] = cfg.levelList[0][attr] + cfg.bodyLevelList[0][attr];
        battleInfo[attr] = battleInfo.base[attr];
        battleInfo.power += battleInfo[attr];
    }
    battleInfo[`nowblood`] = battleInfo.blood;
    return battleInfo;
}

/*******
 * @description: 获取玩家当前血量
 * @param {number} _uid 玩家id
 * @return {Promise<number>} 返回当前血量，获取失败时返回undefined
 */
export async function GetNowBlood(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        return battleInfo?.nowblood;
    });
}

/*******
 * @description: 获取玩家移动速度
 * @param {number} _uid 玩家id
 * @return {Promise<number>} 返回移动速度，获取失败时返回undefined
 */
export async function GetSpeed(_uid) {
    return lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        return battleInfo?.speed;
    });
}

//#endregion

//#region Set方法

/******* 
 * @description: 设置玩家战斗面板信息, 注意该方法会覆盖更新玩家战斗面板, 错误操作后果比较严重, 注意使用
 * @param {number} _uid 玩家id
 * @param {any} _battleInfo 玩家面板信息
 * @return 无返回值
 */
export async function SetBattle(_uid, _battleInfo) {
    lock(`${redisKey}:${_uid}`, async () => {
        await setBattleInfo(_uid, _battleInfo);
    });
}

/**
 * @description: 设置玩家当前血量
 * @param {number} _uid 玩家id
 * @param {number} _nowblood 当前血量
 * @return 无返回
 */
export async function SetNowblood(_uid, _nowblood) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        if (battleInfo == undefined) return;

        battleInfo.nowblood = clamp(forceNumber(_nowblood), 0, battleInfo.blood);
        await setBattleInfo(_uid, battleInfo);
    });
}

/**
 * @description: 血量回复到指定百分比
 * @param {number} _uid 玩家id
 * @param {number} _percent 目标百分比
 * @return 无返回
 */
export async function AddBloodToPercent(_uid, _percent) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        if (battleInfo == undefined) return;

        battleInfo.nowblood = Math.max(battleInfo.nowblood, Math.floor(battleInfo.blood * _percent * 0.01));
        await setBattleInfo(_uid, battleInfo);
    });
}

/**
 * @description: 回复额外百分比血量
 * @param {number} _uid 玩家id 
 * @param {number} _percent 额外百分比
 * @return 无返回
 */
export async function AddPercentBlood(_uid, _percent) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        if (battleInfo == undefined) return;

        battleInfo.nowblood = Math.min(battleInfo.blood, battleInfo.nowblood + Math.floor(battleInfo.blood * _percent * 0.01));
        await setBattleInfo(_uid, battleInfo);
    });
}


/******* 
 * @description: 奇遇，增加基础属性
 * @param {number} _uid 玩家id
 * @param {*} _amount 属性对象
 * @return 无返回
 * @example AddPowerByEvent(10000, {attack : 10, defence : 10}) //效果为玩家(id:10000) 加10基础攻击10基础防御
 */
export async function AddPowerByEvent(_uid, _amount) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        if (battleInfo == undefined) return;

        for (let attr in _amount) {
            if (!allAttrs.includes(attr)) continue;
            battleInfo.base[attr] += forceNumber(_amount[attr]);
        }
        refresh(battleInfo, await GetEquipment(_uid));
        await setBattleInfo(_uid, battleInfo);
    });
}

/******* 
 * @description: 突破升级，增加基础属性
 * @param {number} _uid 玩家id
 * @param {[]} _levelList 等级列表 练气等级表或炼体等级表
 * @param {number} _level 当前等级
 * @return 无返回
 */
export async function AddPowerByLevelUp(_uid, _levelList, _level) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        if (battleInfo == undefined) return;

        allAttrs.forEach(attr => {
            battleInfo.base[attr] += forceNumber(_levelList[_level - 1][attr]) - forceNumber(_levelList[_level - 2][attr]);
        });
        refresh(battleInfo, await GetEquipment(_uid));
        await setBattleInfo(_uid, battleInfo);
    });
}

/******* 
 * @description: 刷新战斗面板
 * @param {number} _uid 玩家id
 * @return 无返回值
 */
export async function RefreshBattle(_uid) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await getBattleInfo(_uid);
        if (battleInfo == undefined) return;

        refresh(battleInfo, await GetEquipment(_uid))
        await setBattleInfo(_uid, battleInfo);
    });
}
//#endregion

//#region 内部方法

/******* 
 * @description: 获取玩家的战斗面板信息
 * @param {number} _uid 玩家id
 * @return {Promise<any>} 战斗面板信息
 */
export async function getBattleInfo(_uid) {
    return await GetInfo(_uid, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 设置玩家的战斗面板信息
 * @param {number} _uid 玩家id
 * @param {any} _battleInfo 玩家面板信息
 * @return 无返回值
 */
export async function setBattleInfo(_uid, _battleInfo) {
    await SetInfo(_uid, _battleInfo, redisKey, path.join(PATH, `${_uid}.json`));
}

/******* 
 * @description: 刷新面板
 * @param {any} battleInfo 目标的战斗信息
 * @param {any} equipmentInfo 目标的装备信息
 * @return 无返回值
 */
function refresh(battleInfo, equipmentInfo) {
    const enhancement = {};
    allAttrs.forEach(attr => enhancement[attr] = 0);

    for (let equipment of equipmentInfo) {          //获取装备，计算增益
        allAttrs.forEach(attr => enhancement[attr] += forceNumber(equipment[attr]));
    }

    const attr1 = ['attack', 'defense', 'blood'];   //根据基础面板计算当前面板
    const attr2 = ['burst', 'burstmax', 'speed'];
    attr1.forEach(attr => battleInfo[attr] = Math.floor(battleInfo.base[attr] * (1 + enhancement[attr] / 100)));
    attr2.forEach(attr => battleInfo[attr] = Math.floor(battleInfo.base[attr] + enhancement[attr]));

    battleInfo.power = 0;
    allAttrs.forEach(attr => battleInfo.power += battleInfo[attr]);
}

//#endregion











