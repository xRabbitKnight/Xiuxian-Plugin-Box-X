import Data from '../../model/XiuxianData.js';
import Fs from 'node:fs';
import MonsterMgr from "../../model/Region/MonsterMgr.js"
import {Monster} from "../../model/Monster/Monster.js";

/******* 
 * @description:  补全所有区域的怪物
 */
 export function RefreshMonster(){
    const regions = JSON.parse(Fs.readFileSync(`${Data.__PATH.position}/position.json`));
    regions.forEach(region => {
        const regionId = region.id.split("-")[1];
        for(let nowCount = MonsterMgr.GetMonsterCount(); nowCount < region.monsterNum; ++nowCount){
            const level = Math.floor(Math.random() * (region.levelMax - region.levelMin) + region.levelMin);
            MonsterMgr.AddMonster(regionId, new Monster(level));
        }
    });
}