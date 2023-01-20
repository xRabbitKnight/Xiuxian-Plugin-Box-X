import config from '../../model/System/config.js';
import * as CD from '../../model/CD/Action.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
import { IsNew, RegNew, SetActionInfo } from '../../model/Cache/player/Action.js';
import { GetItemByName } from '../../model/Cache/item/Item.js';
import { AddItemByObj, AddSpiritStone, SetBackpackInfo } from '../../model/Cache/player/Backpack.js';
import { GetNewBattleInfo, SetBattleInfo } from '../../model/Cache/player/Battle.js';
import { SetEquipmentInfo } from '../../model/Cache/player/Equipment.js';
import { SetLevelInfo } from '../../model/Cache/player/Level.js';
import { SetLifeInfo } from '../../model/Cache/player/Life.js';
import { SetSkillInfo } from '../../model/Cache/player/Skill.js';
import { GetNewTalentInfo, SetTalentInfo } from '../../model/Cache/player/Talent.js';
import { SetWarehouseInfo } from '../../model/Cache/player/Warehouse.js';
import { AddUid } from '../../model/Cache/player/players.js';
import { rand } from '../../model/mathCommon.js';
import { delRedisKeys } from '../../model/utility.js';


export default class UserStart extends plugin {
    constructor() {
        super({
            name: 'UserStart',
            dsc: 'UserStart',
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
        e.reply(`[修仙联盟]方正\n看你骨骼惊奇，就送你一把[${weapon}]吧，还有这里有${wealth}灵石，可在必要的时候用到.`);
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
        await SetActionInfo(uid, newPlayer.action);
        //背包相关
        await SetBackpackInfo(uid, newPlayer.backpack);
        //攻防属性相关, 生成
        await SetBattleInfo(uid, await GetNewBattleInfo());
        //装备相关
        await SetEquipmentInfo(uid, newPlayer.equipment);
        //等级相关
        await SetLevelInfo(uid, newPlayer.level);
        //基础信息相关 部分信息生成
        newPlayer.life.name = e.sender.nickname;
        newPlayer.life.lifetime = rand(50, 100);
        await SetLifeInfo(uid, newPlayer.life);
        //技能相关
        await SetSkillInfo(uid, newPlayer.skill);
        //天赋相关 生成
        await SetTalentInfo(uid, await GetNewTalentInfo());
        //仓库相关
        await SetWarehouseInfo(uid, newPlayer.warehouse);
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