import MonsterMgr from "./mgr.js"
import Monster from "./monster.js";
import Boss from "./boss.js";
import { rand } from '../util/math.js';
import { GetAllArea, GetRandArea } from '../Cache/place/Area.js';


/******* 
 * @description:  所有区域怪物刷新
 */
export async function RefreshMonster() {
    const regions = await GetAllArea();
    regions.forEach(region => {
        const regionId = region.id.split("-")[1];
        for (let nowCount = MonsterMgr.GetMonsterCount(regionId); nowCount < region.monsterNum; ++nowCount) {
            const level = rand(region.levelMin, region.levelMax);
            MonsterMgr.AddMonster(regionId, new Monster({ level: level }));
        }
    });
}

/******* 
 * @description:  随机区域刷新boss
 */
export async function RefreshBoss() {
    const MAX_BOSS_COUNT = 4;
    if (MonsterMgr.Boss.length >= MAX_BOSS_COUNT) return;

    const region = await GetRandArea();
    const targetRegionId = region?.id.split("-")[1];
    logger.info(region.name);
    MonsterMgr.AddMonster(targetRegionId, new Boss());
}