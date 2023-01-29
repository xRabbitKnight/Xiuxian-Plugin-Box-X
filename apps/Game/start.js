/*
 * @described : 玩家新建存档
 */

import config from '../../model/System/config.js';
import * as CD from '../../model/CD/Action.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
import { IsNew, RegNew, SetAction } from '../../model/Cache/player/Action.js';
import { GetItemByName } from '../../model/Cache/item/Item.js';
import { AddItemByObj, AddSpiritStone, SetBackpack } from '../../model/Cache/player/Backpack.js';
import { GetNewBattle, SetBattle } from '../../model/Cache/player/Battle.js';
import { SetEquipment } from '../../model/Cache/player/Equipment.js';
import { SetLevel } from '../../model/Cache/player/Level.js';
import { SetLife } from '../../model/Cache/player/Life.js';
import { SetSkill } from '../../model/Cache/player/Skill.js';
import { GetNewTalent, SetTalent } from '../../model/Cache/player/Talent.js';
import { SetWarehouse } from '../../model/Cache/player/Warehouse.js';
import { AddUid } from '../../model/Cache/player/players.js';
import { rand } from '../../model/util/math.js';
import { delRedisKeys } from '../../model/util/gameUtil.js';

export default class start extends plugin {
    constructor() {
        super({
            name: 'start',
            dsc: '玩家新加游戏相关指令',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#降临世界$',
                    fnc: 'Create'
                },
                {
                    reg: '^#再入仙途$',
                    fnc: 'ReCreate'
                },
                {
                    reg: '^#联盟报到$',
                    fnc: 'NewSupport'
                }
            ]
        });
    }

    NewSupport = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '联盟')) {
            e.reply(`需回联盟`);
            return;
        }

        if (!await IsNew(e.user_id)) {
            e.reply('你已经报到过了！');
            return;
        }

        const weapon = await GetItemByName('烂铁匕首');
        const wealth = 100;
        e.reply(`[修仙联盟]方正\n看你骨骼惊奇，就送你一把[${weapon.name}]吧，还有这里有${wealth}灵石，已经放到你的储物袋里了，可以#储物袋查看.`);
        AddItemByObj(e.user_id, weapon, 1);
        AddSpiritStone(e.user_id, wealth);
        RegNew(e.user_id);
    }

    Create = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        if (await CheckStatu(e, StatuLevel.exist, false)) {
            e.reply('重开请 #再入仙途');
            return;
        }

        const uid = e.user_id;
        //获取基础配置
        const newPlayer = config.GetConfig('game/start.yaml');
        //行为相关
        await SetAction(uid, newPlayer.action);
        //背包相关
        await SetBackpack(uid, newPlayer.backpack);
        //攻防属性相关, 生成
        await SetBattle(uid, await GetNewBattle());
        //装备相关
        await SetEquipment(uid, newPlayer.equipment);
        //等级相关
        await SetLevel(uid, newPlayer.level);
        //基础信息相关 部分信息生成
        newPlayer.life.name = e.sender.nickname;
        newPlayer.life.lifetime = rand(50, 100);
        await SetLife(uid, newPlayer.life);
        //技能相关
        await SetSkill(uid, newPlayer.skill);
        //天赋相关 生成
        await SetTalent(uid, await GetNewTalent());
        //仓库相关
        await SetWarehouse(uid, newPlayer.warehouse);
        //添加players
        await AddUid(uid);

        e.reply(`你来到一个修仙世界\n你对修仙充满了好奇\n你可以#前往极西联盟\n进行#联盟报到\n会得到[修仙联盟]的帮助\n更快的成为练气修士\n也可以#基础信息\n查看自己的身世\n若想快速去往天山\n建议#前往极西传送阵\n进行#传送天山`);
    }

    ReCreate = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        if (await CD.IfActionInCD(e.user_id, 'reBorn', e.reply)) {
            return;
        }

        delRedisKeys(e.user_id);
        e.reply('来世,信则有,不信则无,岁月悠悠,世间终会出现两朵相同的花,千百年的回眸,一花凋零,一花绽。是否为同一朵,任后人去评断');
        await this.Create(e);

        CD.AddActionCD(e.user_id, 'reBorn');
    }
}