import { refreshNian } from "./SpringFestival.js";

export default class SpringFestival extends plugin{
    constructor(){
        super({
            name: '春节活动',
            dsc: '春节活动指令',
            event: 'message',
            priority: 300,
            rule: [
                {
                    reg: '^#刷新年兽$',
                    fnc: 'refresh',
                    permission: 'master'
                }
            ]
        });
    }

    refresh = async () => {
        const gid = 1171271077;
        const areas = await refreshNian();
        Bot.sendGroupMsg(gid, `年兽带着大礼包出现在${areas.join('，')} 快去抢大礼包吧！`);
    }
}