import plugin from "../../../../lib/plugins/plugin.js";
import data from "../../model/System/data.js";
import { segment } from "oicq";
import { CheckStatu, StatuLevel } from "../../model/Statu/Statu.js";
import { GetBattle, RefreshBattle, SetBattle } from "../../model/Cache/player/Battle.js";
import { GetLevel } from "../../model/Cache/player/Level.js";
import { RefreshBoss } from "../../model/Monster/refresh.js";
import { GetAllUid } from "../../model/Cache/player/players.js";
import { GetSpiritualRoot, GetTalent, SetTalent } from "../../model/Cache/player/Talent.js";
import { GetAllSkill, SetSkill } from "../../model/Cache/player/Skill.js";
import { GetItemObj } from "../../model/Cache/item/Item.js";
import { WriteAsync } from "../../model/File/File.js";
import { forceNumber, getAtUid } from "../../model/util";
import { AddItemToBackpack } from "../../model/Cache";


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
                {
                    reg: '^#补偿.*$',
                    fnc: 'give',
                    permission: 'master'
                }

            ]
        });
    }

    give = async (e) => {
        const doneeId = getAtUid(e);

        if (doneeId == undefined || !await CheckStatu({ user_id: doneeId }, StatuLevel.alive, false)) {
            e.reply("玩家不存在！");
            return;
        }

        let [propName, count] = e.msg.replace('#补偿', '').replace('{at:*}', '').split('*');
        count = Math.max(forceNumber(count), 1);

        const prop = await GetItemObj({ name: propName, count: count });
        if (prop == undefined) {
            e.reply(`道具${propName}不存在`);
            return;
        }

        AddItemToBackpack(doneeId, prop, count);
        e.reply([segment.at(doneeId), `你获得补偿${propName} * ${count}`]);
    }

    refreshBoss = async () => {
        RefreshBoss();
    }

    refreshPlayerBase = async () => {
        const players = await GetAllUid();
        players.forEach(async (player) => {
            const battleInfo = await GetBattle(player);
            const levelInfo = await GetLevel(player);
            if (battleInfo == undefined || levelInfo == undefined) return;

            for (let attr in battleInfo.base) {
                battleInfo.base[attr] = forceNumber(data.levelList[levelInfo.level - 1][attr]) + forceNumber(data.bodyLevelList[levelInfo.bodyLevel - 1][attr]);
            }
            battleInfo.nowblood = battleInfo.base.blood;
            await SetBattle(player, battleInfo);
            RefreshBattle(player);
        });
    }

    refreshPlayerManual = async () => {
        const players = await GetAllUid();
        players.forEach(async (player) => {
            const talentInfo = await GetTalent(player);
            if (talentInfo == undefined) return;

            const newManual = [];
            talentInfo.manualList.forEach(manual => {
                newManual.push({
                    name: manual.name,
                    buff: manual.buff,
                    maxBuff: Math.floor(manual.buff * 1.5),
                })
            })
            talentInfo.manualList = newManual;
            SetTalent(player, talentInfo);
        });
    }

    refreshPlayerSkill = async () => {
        const players = await GetAllUid();
        players.forEach(async (player) => {
            const spiritualRoots = await GetSpiritualRoot(player);
            const skills = await GetAllSkill(player);

            for (let sk of skills) {
                const skill = await GetItemObj({ name: `技能书：${sk.name}` });
                let power = skill.power;
                //每多一种符合属性的灵根 +20倍率， 多一种不合属性的 -10倍率
                spiritualRoots.forEach(sr => {
                    const result = skill.spiritualRoot.find(root => sr == root);
                    power += (result == undefined ? -10 : 20);
                });
                sk.power = power;
            }

            const obj = { skillList: skills };
            SetSkill(player, obj);
            WriteAsync(`${data.__gameDataPath.skill}/${player}.json`, JSON.stringify(obj));
        });
    }
}

