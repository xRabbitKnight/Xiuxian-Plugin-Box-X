import Data from '../../model/XiuxianData.js';
import Fs from 'node:fs';
import MonsterMgr from "../../model/Region/MonsterMgr.js"
import {Monster} from "../../model/Monster/Monster.js";
import { rand } from '../mathCommon.js';

/******* 
 * @description:  补全所有区域的怪物
 */
 export async function RefreshMonster(){
    const regions = JSON.parse(Fs.readFileSync(`${Data.__PATH.position}/position.json`));
    regions.forEach(region => {
        const regionId = region.id.split("-")[1];
        for(let nowCount = MonsterMgr.GetMonsterCount(regionId); nowCount < region.monsterNum; ++nowCount){
            const level = rand(region.levelMin, region.levelMax);
            MonsterMgr.AddMonster(regionId, new Monster(level));
        }
    });
}