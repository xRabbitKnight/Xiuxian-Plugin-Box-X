/*
 * @described : 
    新春活动，打年兽！年兽！

    每次刷4只年兽，带4个大礼包
    技能书礼包，功法礼包，装备礼包，丹药礼包
 */

import { MonsterTip } from "../../../../model/Battle/BattleDrop.js";
import { rand } from "../../../../model/mathCommon.js";
import { Nian } from "./Nian.js";
import { GetRandItem } from "../../../../model/Cache/item/Item.js";
import { GetAllArea } from "../../../../model/Cache/place/Area.js";
import MonsterMgr from "../../../../model/Region/MonsterMgr.js";
import { AddItemsByObj, AddSpiritStone } from "../../../../model/Cache/player/Backpack.js";


/** 初始化载入年兽掉落 */
export async function init() {
   MonsterTip['nian'] = nian;
}

/**
 * @description: 刷新4只带礼包的年兽加入monsterMgr 
 * @return {Promise<[]>} 返回年兽刷新的位置名数组
 */
export async function refreshNian() {
   const regions = await GetAllArea();
   const targetRegions = [];

   let nian, targetRegion;

   const preSet = [
      {
         giftName: '技能书大礼包',
         type: "7",
         count: 8,
      }, {
         giftName: '功法大礼包',
         type: "5",
         count: 10
      }, {
         giftName: '装备大礼包',
         type: "3",
         count: 10
      }, {
         giftName: '丹药大礼包',
         type: "4",
         count: 40
      }
   ];

   //刷新年兽 配置礼包 加入MonsterMgr
   for(let set of preSet){
      nian = new Nian();
      nian.giftName = set.giftName;
      nian.gift = await GetRandItem(set.type, set.count);
      targetRegion = regions[rand(0, regions.length)];
      MonsterMgr.AddMonster(targetRegion.id.split('-')[1], nian);
      targetRegions.push(targetRegion.name);
   };

   return targetRegions;
}

//灵石掉落随机数值
const spiritStone = [88888, 66666, 202288, 202366];

/** 年兽掉落 */
async function nian(_uid, _nian, _msg) {
   _msg.push('你获得了年兽带来的大礼包！');

   const spStone = spiritStone[rand(0, spiritStone.length)];
   _msg.push(`你获得了${spStone}灵石！`);
   AddSpiritStone(_uid, spStone);

   _msg.push(`你获得了${_nian.giftName}！`);
   _nian.gift.forEach(item => _msg.push(`你获得了${item.name} * ${item.acount}.`));
   AddItemsByObj(_uid, _nian.gift);
   _msg.push(`新年快乐！`);
}