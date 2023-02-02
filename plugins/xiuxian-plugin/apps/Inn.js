import config from "../../../model/System/config.js";
import data from "../model/System/data.js";
import MonsterMgr from "../../../model/Monster/mgr.js";
import { IfAtSpot } from "../../../model/Cache/place/Spot.js";
import { GetSpiritStoneCount, AddSpiritStone } from "../../../model/Cache/player/Backpack.js";
import { CheckStatu, StatuLevel } from "../../../model/Statu/Statu.js";
import { GetAreaName, GetRandArea } from "../../../model/Cache/place/Area.js";
import { rand } from "../../../model/util/math.js";
import { randItem } from "../../../model/util/commonUtil.js";

/** 可打听消息数量 */
let msgCount = 4;
/** 已经提供错误消息数 */
let errorMsgCount = 0;
/** 正确消息保底 */
const MaxErrorMsgCount = 4;
/** 消息正确概率(%) */
const TrueMsgPercent = 50;

export default class Inn extends plugin {
    constructor() {
        super({
            name: 'Inn',
            dsc: '有间客栈',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#小道消息$',
                    fnc: 'Hearsay',
                },
                {
                    reg: '^#打听消息$',
                    fnc: 'Ask',
                }
            ]
        });

        this.task = {
            name: "定时获取打听消息",
            cron: config.GetConfig('task/inn.yaml', data.__configPath).cron,
            fnc: () => this.GetMsg(),
        }
    }

    Hearsay = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '有间客栈')) {
            e.reply(`有间客栈有各种小道消息！花费一些灵石即可获取！`);
            return;
        }

        const spStoneCount = await GetSpiritStoneCount(e.user_id);
        if (spStoneCount == undefined || spStoneCount < 1000) {
            e.reply('[小二] 客官，这消息多少得花1000灵石吧！');
            return;
        }

        AddSpiritStone(e.user_id, -1000);
        e.reply(`[小二] 传言道，当今修仙界共有「${MonsterMgr.Boss.length}」头不同寻常的上古凶兽！`);
    }

    Ask = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '有间客栈')) {
            e.reply(`有间客栈有各种小道消息！花费一些灵石即可获取！`);
            return;
        }

        if (msgCount <= 0 || MonsterMgr.Boss.length <= 0) {
            e.reply(`[小二] 不好意思客官，小店目前没打听到什么消息。`);
            return;
        }

        const spStoneCount = await GetSpiritStoneCount(e.user_id);
        if (spStoneCount == undefined || spStoneCount < 2000) {
            e.reply('[小二] 客官，这消息多少得花2000灵石吧！');
            return;
        }

        const result = (errorMsgCount / MaxErrorMsgCount == 1) || rand(0, 100) < TrueMsgPercent;

        const place = result ?
            (await GetAreaName(randItem(MonsterMgr.Boss).region)) : //正确地点
            (await GetRandArea())?.name;  //随机错误地点

        AddSpiritStone(e.user_id, -2000);
        errorMsgCount = result ? 0 : errorMsgCount + 1;
        msgCount--;

        e.reply(`[小二] 听闻「${place}」附近有奇怪的动静....`);
    }

    GetMsg = async (e) => {
        msgCount++;
    }
}