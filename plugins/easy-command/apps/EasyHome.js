import { IfAtSpot } from '../../../model/Cache/place/Spot.js';
import { CheckSpiritStone, GetBackpackInfo, SetBackpackInfo, SortById } from '../../../model/Cache/player/Backpack.js';
import { AddBodyExp, AddExp } from '../../../model/Cache/player/Level.js';
import { CheckStatu, StatuLevel } from '../../../model/Statu/Statu.js';
import { replyForwardMsg } from '../../../model/utility.js';
import { GetCommodities, SetCommodities } from '../../xiuxian-plugin/model/Cache/shop.js';
import { filterItemsByName, listItems, mergeItems } from '../model/utils.js';

export default class EasyHome extends plugin {
    constructor() {
        super({
            name: 'EasyHome',
            dsc: 'Easy commands for user home',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#快捷恢复[0-9]+%$',
                    fnc: 'easyRecover'
                },
                {
                    reg: '^#快捷服用(修为|气血)药$',
                    fnc: 'easyAddExp'
                },
                {
                    reg: '^#快捷学习(功法|技能)$',
                    fnc: 'easyLearn'
                }
            ]
        })
    }

    easyRecover = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }
        e.reply('开发中...');
    }

    easyAddExp = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }

        let itemName = e.msg.substr(5);
        let backpack = await GetBackpackInfo(e.user_id);
        let {included, excluded} = await filterItemsByName(itemName, backpack.items);

        if (included.length < 1) {
            e.reply(`你没有可以服用的[${itemName}]！`);
            return;
        }

        let totolExp = 0, msgList;
        if (itemName == '修为药') {
            included.forEach(item => {
                totolExp += item.experience * item.acount;
            });
            AddExp(e.user_id, totolExp);
            msgList = listItems(`修为增加${totolExp}`, included);
        } else if (itemName == '气血药') {
            included.forEach(item => {
                totolExp += item.experiencemax * item.acount;
            });
            AddBodyExp(e.user_id, totolExp);
            msgList = listItems(`气血增加${totolExp}`, included);
        }
        replyForwardMsg(e, msgList);

        backpack.items = excluded;
        SetBackpackInfo(e.user_id, backpack);
    }

    easyLearn = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) {
            return;
        }
        e.reply('开发中...');
    }
}
