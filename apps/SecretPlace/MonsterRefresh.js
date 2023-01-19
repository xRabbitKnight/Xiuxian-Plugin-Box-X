import plugin from "../../../../lib/plugins/plugin.js";
import { GetBattleInfo, RefreshBattleInfo, SetBattleInfo } from "../../model/Cache/player/Battle.js";
import { GetLevelInfo } from "../../model/Cache/player/Level.js";
import { forceNumber } from "../../model/mathCommon.js";
import data from "../../model/System/data.js";
import { RefreshBoss } from "../../model/Region/Region.js";
import { GetAllUid } from "../../model/Cache/player/players.js";
import { GetSpiritualRoot, GetTalentInfo, SetTalentInfo } from "../../model/Cache/player/Talent.js";
import { GetAllSkill, SetSkillInfo } from "../../model/Cache/player/Skill.js";
import { GetItemByName } from "../../model/Cache/item/Item.js";
import { WriteAsync } from "../../model/File/File.js";


export default class MonsterRefresh extends plugin {
    constructor() {
        super({
            name: "刷新怪物",
            dsc: "定时刷新每个区域的怪物",
            event: 'message',
            priority: 300,
            rule: [
                {
                    reg: '^#刷新boss$',
                    fnc: 'refreshBoss',
                    permission: 'master'
                },
                {
                    reg: '^#刷新玩家基础面板$',
                    fnc: 'refreshPlayerBase',
                    permission: 'master'
                },
                {
                    reg: '^#刷新玩家功法列表$',
                    fnc: 'refreshPlayerManual',
                    permission: 'master'
                },
                {
                    reg: '^#刷新玩家技能列表$',
                    fnc: 'refreshPlayerSkill',
                    permission: 'master'
                },

            ]
        });
    }

    refreshBoss = async () => {
        RefreshBoss();
    }

    refreshPlayerBase = async () => {
        const players = await GetAllUid();
        players.forEach(async (player) => {
            const battleInfo = await GetBattleInfo(player);
            const levelInfo = await GetLevelInfo(player);
            if (battleInfo == undefined || levelInfo == undefined) return;

            Object.keys(battleInfo.base).forEach(attr => {
                battleInfo.base[attr] = forceNumber(data.levelList[levelInfo.level - 1][attr]) + forceNumber(data.bodyLevelList[levelInfo.bodyLevel - 1][attr]);
            });
            battleInfo.nowblood = battleInfo.base.blood;
            await SetBattleInfo(player, battleInfo);
            RefreshBattleInfo(player);
        });
    }

    refreshPlayerManual = async () => {
        const players = await GetAllUid();
        players.forEach(async (player) => {
            const talentInfo = await GetTalentInfo(player);
            if (talentInfo == undefined) return;

            const newManual = [];
            talentInfo.manualList.forEach(manual => {
                newManual.push({
                    name: manual.name,
                    buff: manual.size,
                })
            })
            talentInfo.manualList = newManual;
            SetTalentInfo(player, talentInfo);
        });
    }

    refreshPlayerSkill = async () => {
        const players = await GetAllUid();
        players.forEach(async (player) => {
            const spiritualRoots = await GetSpiritualRoot(player);
            const skills = await GetAllSkill(player);

            for(let sk of skills){
                const skill = await GetItemByName(`技能书：${sk.name}`, 1);
                let power = skill.power;
                //每多一种符合属性的灵根 +20倍率， 多一种不合属性的 -10倍率
                spiritualRoots.forEach(sr => {
                    const result = skill.spiritualRoot.find(root => sr == root);
                    power += (result == undefined ? -10 : 20);
                });
                sk.power = power;
            }

            const obj = {skillList : skills};
            SetSkillInfo(player, obj);
            WriteAsync(`${data.__gameDataPath.skill}/${player}.json`, JSON.stringify(obj));
        });
    }
}

