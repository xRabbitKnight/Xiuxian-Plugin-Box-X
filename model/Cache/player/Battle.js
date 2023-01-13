import data from '../../System/data.js';
import { lock } from '../base.js';
import { forceNumber } from '../../mathCommon.js';
import { GetEquipmentInfo } from './Equipment.js';
import { GetInfo, SetInfo } from './InfoCache.js';

const redisKey = "xiuxian:player:battleInfo";
const PATH = data.__gameDataPath.battle;

/******* 
 * @description: 从cache里获取玩家的战斗面板信息
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @return {Promise<JSON>} 返回的BattleInfo JSON对象
 */
export async function GetBattleInfo(_uid) {
    return await GetInfo(_uid, redisKey, `${PATH}/${_uid}.json`);
}

/******* 
 * @description: 更新玩家战斗面板信息, 并写入数据
 * @param {string} _uid 玩家id, plugin参数e.user_id
 * @param {JSON} _battleInfo 玩家面板信息, 注意是JSON对象
 * @return 无返回值
 */
export async function SetBattleInfo(_uid, _battleInfo) {
    await SetInfo(_uid, _battleInfo, redisKey, `${PATH}/${_uid}.json`);
}

/*******
 * @description: 获取玩家移动速度
 * @param {string} _uid 玩家id
 * @return {Promise<number>} 返回移动速度，获取失败时返回undefined
 */
export async function GetSpeed(_uid) {
    const battleInfo = await GetBattleInfo(_uid);
    return battleInfo?.speed;
}

/**
 * @description: 血量回复到指定百分比
 * @param {string} _uid 玩家id
 * @param {number} _percent 回复到百分比
 * @return 无返回
 */
export async function AddBloodToPercent(_uid, _percent) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await GetBattleInfo(_uid);
        if (battleInfo == undefined) return;

        battleInfo.nowblood = Math.max(battleInfo.nowblood, Math.floor(battleInfo.blood * _percent * 0.01));
        await SetBattleInfo(_uid, battleInfo);
    });
}

/**
 * @description: 回复额外百分比血量
 * @param {string} _uid 玩家id 
 * @param {number} _percent 回复到百分比
 * @return 无返回
 */
export async function AddPercentBlood(_uid, _percent) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await GetBattleInfo(_uid);
        if (battleInfo == undefined) return;

        battleInfo.nowblood = Math.min(battleInfo.blood, battleInfo.nowblood + Math.floor(battleInfo.blood * _percent * 0.01));
        await SetBattleInfo(_uid, battleInfo);
    });
}

/******* 
 * @description: 突破升级，增加基础属性
 * @param {string} _uid 玩家id
 * @param {[]} _levelList 等级列表 练气等级表或炼体等级表
 * @param {number} _level 当前等级
 * @return 无返回
 */
export async function AddPowerByLevelUp(_uid, _levelList, _level) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await GetBattleInfo(_uid);
        if (battleInfo == undefined) return;

        Object.keys(battleInfo.base).forEach(attr => {
            battleInfo.base[attr] += forceNumber(_levelList[_level - 1][attr]) - forceNumber(_levelList[_level - 2][attr]);
        });
        refresh(battleInfo, await GetEquipmentInfo(_uid));
        await SetBattleInfo(_uid, battleInfo);
    });
}

/******* 
 * @description: 刷新战斗面板
 * @param {string} _uid 玩家id
 * @return 无返回值
 */
export async function RefreshBattleInfo(_uid) {
    lock(`${redisKey}:${_uid}`, async () => {
        const battleInfo = await GetBattleInfo(_uid);
        if (battleInfo == undefined) return;

        refresh(battleInfo, await GetEquipmentInfo(_uid))
        await SetBattleInfo(_uid, battleInfo);
    });
}


/******* 
 * @description: 刷新面板
 * @param {*} battleInfo 需要刷新的对象战斗信息
 * @param {*} equipmentInfo 需要刷新的对象装备信息
 * @return 无返回值
 */
function refresh(battleInfo, equipmentInfo) {
    const allAttrs = ['attack', 'defense', 'blood', 'burst', 'burstmax', 'speed'];
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