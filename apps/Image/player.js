import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
import * as _ from '../../model/Image/player.js';

export default class playerImage extends plugin {
    constructor() {
        super({
            name: 'playerImage',
            dsc: '玩家相关信息展示',
            event: 'message',
            priority: 400,
            rule: [
                {
                    reg: '^#基础信息$',
                    fnc: 'PlayerInfo'
                },
                {
                    reg: '^#装备信息$',
                    fnc: 'EquipmentInfo',
                },
                {
                    reg: '^#功法信息$',
                    fnc: 'ManualInfo',
                },
                {
                    reg: '^#技能信息$',
                    fnc: 'SkillInfo',
                },
                {
                    reg: '^#练气境界$',
                    fnc: 'Level',
                },
                {
                    reg: '^#炼体境界$',
                    fnc: 'BodyLevel',
                },
                {
                    reg: '^#储物袋$',
                    fnc: 'ShowBackpack'
                },
                {
                    reg: '^#仓库$',
                    fnc: 'ShowWarehouse'
                },
            ]
        });
    }

    PlayerInfo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) return;
        e.reply(await _.GetPlayerInfoImage(e.user_id));
    }

    EquipmentInfo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) return;
        e.reply(await _.GetEquipmentImage(e.user_id));
    }

    ManualInfo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) return;
        e.reply(await _.GetManualImage(e.user_id));
    }

    SkillInfo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) return;
        e.reply(await _.GetSkillImage(e.user_id));
    }

    Level = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) return;
        e.reply(await _.GetLevelImage(e.user_id));
    }

    BodyLevel = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) return;
        e.reply(await _.GetBodyLevelImage(e.user_id));
    }

    ShowBackpack = async (e) => {
        if (!await CheckStatu(e, StatuLevel.alive)) return;
        e.reply(await _.GetBackpackImage(e.user_id));
    }

    ShowWarehouse = async (e) => {
        if (!await CheckStatu(e, StatuLevel.isMoving)) return;

        if (!await IfAtSpot(e.user_id, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        e.reply(await _.GetWarehouseImage(e.user_id));
    }
}
