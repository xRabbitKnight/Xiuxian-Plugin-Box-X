import MonsterMgr from "./mgr.js"
import Monster from "./monster.js";
import Boss from "./boss.js";
import { rand } from '../util/math.js';
import { GetAllArea, GetAreaName } from '../Cache/place/Area.js';


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
    if (MonsterMgr.BossCount == undefined) MonsterMgr.BossCount = 0;
    if (MonsterMgr.BossCount >= MAX_BOSS_COUNT) return;

    MonsterMgr.BossCount += 1;
    const regions = await GetAllArea();
    const targetRegionId = regions[rand(0, regions.length)].id.split("-")[1];
    logger.info(await GetAreaName(targetRegionId));
    MonsterMgr.AddMonster(targetRegionId, new Boss());
}