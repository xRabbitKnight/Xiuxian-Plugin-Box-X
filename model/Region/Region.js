import Plugin from "../../../../lib/plugins/plugin.js";
import Data from '../../model/XiuxianData.js';
import Fs from 'node:fs';
import MonsterMgr from "./MonsterMgr.js"
import Monster from "../Monster/monster.js";

//TODO: 这玩意应该扔到配置里
const CRON_REFREASH = "0 0 0/1 * * ?"

export class MonsterRefresh extends Plugin {
    constructor() {
        super({
            name: "刷新怪物",
            dsc: "定时刷新每个区域的怪物",
            task:[
                {
                    cron: CRON_REFREASH,
                    fnc : () => this.refreshTask()
                }
            ] 
        });
    };

    async refreshTask() {
        RefreshMonster();
    }
}

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