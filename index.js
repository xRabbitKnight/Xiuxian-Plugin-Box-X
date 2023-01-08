import GameMgr from "./model/System/GameMgr.js";

await GameMgr.Init();
const apps = await GameMgr.apps;

logger.info(`Xiuxian-Plugin-Box[V3]`);
export {apps};