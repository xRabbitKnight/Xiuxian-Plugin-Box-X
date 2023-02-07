/*
 * @described : 玩家个人信息
 */

import * as CD from '../../model/CD/Action.js';
import { CheckSensitiveWord } from '../../model/util';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import {
    IfAtSpot,
    SetAutograph, SetName
} from '../../model/Cache';

export default class personal extends plugin {
    constructor() {
        super({
            name: 'personal',
            dsc: '玩家个人信息设置相关指令',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#改名.*$',
                    fnc: 'Rename'
                },
                {
                    reg: '^#设置道宣.*$',
                    fnc: 'ChangeAutograph'
                }
            ]
        });
    }

    Rename = async (e) => {
        const uid = e.user_id;

        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (await CD.IfActionInCD(uid, 'reName', e.reply)) {
            return;
        }

        if (!await IfAtSpot(uid, '联盟')) {
            e.reply(`需回联盟`);
            return;
        }

        const name = e.msg.replace('#改名', '');

        if (name.length == 0 || name.length > 8) {
            e.reply('道号限制1-8个字！');
            return;
        }

        if (CheckSensitiveWord(name)) {
            e.reply('请文明修仙！');
            return;
        }

        SetName(uid, name);
        CD.AddActionCD(uid, 'reName');
    }

    ChangeAutograph = async (e) => {
        const uid = e.user_id;

        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        if (await CD.IfActionInCD(uid, 'autograph', e.reply)) {
            return;
        }

        const autograph = e.msg.replace('#设置道宣', '');
        if (autograph.length == 0 || autograph.length > 50) {
            e.reply('道宣限制1-50字！');
            return;
        }

        if (CheckSensitiveWord(autograph)) {
            e.reply('请文明修仙！');
            return;
        }

        SetAutograph(uid, autograph);
        CD.AddActionCD(uid, 'autograph');
    }
}