import GameMgr from "./model/System/GameMgr.js";

// const xiuxain = await index.toindex('apps');
// const plugin = await index.toindex('plugins');
// const apps={...xiuxain,...plugin};


// logger.info(await GameMgr.apps);

await GameMgr.Init();
const apps = await GameMgr.apps;

logger.info(`Xiuxian-Plugin-Box[V3]`);
export {apps};