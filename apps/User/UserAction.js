import config from '../../model/System/config.js';
import { forceNumber } from '../../model/mathCommon.js';
import { IfAtSpot } from '../../model/Cache/place/Spot.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { GetBackpackInfo, SetBackpackInfo, AddItemByObj as bpAddItem, GetItemByName as bpGetItem } from '../../model/Cache/player/Backpack.js';
import { GetWarehouseInfo, SetWarehouseInfo, AddItemByObj as whAddItem, GetItemByName as whGetItem } from '../../model/Cache/player/Warehouse.js';

export default class UserAction extends plugin {
    constructor() {
        super({
            name: 'UserAction',
            dsc: 'UserAction',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#升级储物袋$',
                    fnc: 'UpgradeBackpack'
                },
                {
                    reg: '^#(存|取)灵石(.*)$',
                    fnc: 'AccessSpiritStone'
                },
                {
                    reg: '^#(存|取)(.*)$',
                    fnc: 'AccessItem'
                }
            ]
        });
    }

    UpgradeBackpack = async (e) => {
        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '炼器师协会')) {
            e.reply(`需回炼器师协会`);
            return;
        }

        const backpack = await GetBackpackInfo(e.user_id);
        const cfg = config.GetConfig('game/backpack.yaml');

        if (backpack.grade == cfg.maxLevel) {
            e.reply('已经是最高级的了');
            return;
        }
        if (backpack.spiritStone < cfg.upgradeCost[backpack.grade]) {
            e.reply(`灵石不足,还需要准备${cfg.upgradeCost[backpack.grade] - backpack.spiritStone}灵石`);
            return;
        }

        backpack.spiritStone -= cfg.upgradeCost[backpack.grade];
        backpack.capacity = cfg.capacity[backpack.grade];
        backpack.grade += 1;
        SetBackpackInfo(e.user_id, backpack);
        e.reply('储物袋升级完毕！');
    }

    AccessSpiritStone = async (e) => {
        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        const backpack = await GetBackpackInfo(e.user_id);
        const warehouse = await GetWarehouseInfo(e.user_id);
        let count = Math.max(1, forceNumber(e.msg.substr(4)));  //修正灵石数量至少为1

        const op = e.msg[1];

        if (op == '存' ? backpack.spiritStone < count : warehouse.spiritStone < count) {
            e.reply('灵石不足!');
            return;
        }

        count *= (op == '取' ? 1 : -1);
        if (backpack.spiritStone + count > backpack.capacity) {
            e.reply(`储物袋最多只能存下${backpack.capacity - backpack.spiritStone}灵石！`);
            return;
        }

        backpack.spiritStone += count;
        warehouse.spiritStone -= count;
        SetBackpackInfo(e.user_id, backpack);
        SetWarehouseInfo(e.user_id, warehouse);
        e.reply(`操作完成！储物袋灵石:${backpack.spiritStone}, 仓库灵石:${warehouse.spiritStone}`);
    }

    AccessItem = async (e) => {
        if (!await CheckStatu(e, StatuLevel.isMoving)) {
            return;
        }

        if (!await IfAtSpot(e.user_id, '万宝楼')) {
            e.reply(`需回万宝楼`);
            return;
        }

        let [name, count] = e.msg.substr(2).split('*');
        count = Math.max(1, forceNumber(count));    //修正数量至少为1

        const op = e.msg.substr(1, 1);
        const item = (op == '存' ? await bpGetItem(e.user_id, name) : await whGetItem(e.user_id, name));
        if (item == undefined || item.acount < count) {
            e.reply(`没有足够的${name} * ${count}!`);
            return;
        }

        count *= (op == '存' ? -1 : 1);
        bpAddItem(e.user_id, item, count);
        whAddItem(e.user_id, item, -count);
        e.reply('操作成功！')
    }
};