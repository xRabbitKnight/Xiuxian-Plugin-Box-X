import plugin from '../../../../lib/plugins/plugin.js';
import config from '../../model/Config.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { AddItemByObj, GetItemByName } from '../../model/Cache/player/Backpack.js';
import { AddEquipment, DelEquipment, GetEquipmentCount } from '../../model/Cache/player/Equipment.js';
import { RefreshBattleInfo } from '../../model/Cache/player/Battle.js';

export class Userequipment extends plugin {
    constructor() {
        super({
            name: 'Userequipment',
            dsc: 'Userequipment',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#装备.*$',
                    fnc: 'Equip'
                },
                {
                    reg: '^#卸下.*$',
                    fnc: 'UnEquip'
                }
            ]
        });
        this.maxEquipment = config.getConfig('xiuxian', 'xiuxian').maxEquipment;
    }

    Equip = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        const name = e.msg.replace('#装备', '');
        const equipment = await GetItemByName(e.user_id, name);
        if (equipment == undefined) {
            e.reply(`没有${name}.`);
            return;
        }

        if (equipment.id[0] == '4' || equipment.id[0] == '5' || equipment.id[0] == '6') {
            e.reply(`不可装备${name}.`);
            return;
        }

        if (await GetEquipmentCount(e.user_id) >= this.maxEquipment) {
            e.reply(`装备数已达上限！`);
            return;
        }

        AddEquipment(e.user_id, equipment);
        AddItemByObj(e.user_id, equipment, -1);
        RefreshBattleInfo(e.user_id);
        e.reply(`装备${name}`);
    }

    UnEquip = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        const name = e.msg.replace('#卸下', '');

        const equipment = await DelEquipment(e.user_id, name);
        if (equipment == undefined) {
            e.reply(`没有${name}.`);
            return;
        }

        AddItemByObj(e.user_id, equipment, 1);
        RefreshBattleInfo(e.user_id);
        e.reply(`已卸下${name}`);
    }
}