import plugin from '../../../../lib/plugins/plugin.js';
import { segment } from 'oicq';
import { ForwardMsg } from '../Xiuxian/Xiuxian.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { inRange, rand } from '../../model/mathCommon.js';
import { AddItemByObj, AddSpiritStone, GetItemByName, GetSpiritStoneCount } from '../../model/Cache/player/Backpack.js';
import { GetSpeed } from '../../model/Cache/player/Battle.js';
import { GetActionInfo, SetActionInfo } from '../../model/Cache/player/Action.js';
import { GetAllSpot, IfAtSpot } from '../../model/Cache/place/Spot.js';
import { GetAllArea } from '../../model/Cache/place/Area.js';

const isMoving = [];
export default class SecretPlace extends plugin {
    constructor() {
        super({
            name: 'SecretPlace',
            dsc: 'SecretPlace',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#坐标信息$',
                    fnc: 'ShowCoordinate'
                },
                {
                    reg: '^#前往.*$',
                    fnc: 'GoTo'
                },
                {
                    reg: '^#回到原地$',
                    fnc: 'GoBack'
                },
                {
                    reg: '^#传送.*$',
                    fnc: 'Teleport'
                },
                {
                    reg: '^#位置信息$',
                    fnc: 'ShowCity'
                }
            ]
        });
    }

    ShowCity = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        const action = await GetActionInfo(e.user_id);
        if (action.address != '1') {
            e.reply('你对这里并不了解...');
            return;
        }

        const addressId = `${action.z}-${action.region}-${action.address}`;
        const points = (await GetAllSpot()).filter(spot => spot.id.includes(addressId));
        const msg = [];
        points.forEach(point => msg.push(`地点名:${point.name}\n坐标:(${point.x},${point.y})`));
        ForwardMsg(e, msg);
    }

    GoBack = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        redis.del(`xiuxian:player:${e.user_id}:moving`);
        clearTimeout(isMoving[e.user_id]);
        e.reply('你回到了原地');
    }

    ShowCoordinate = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canMove)) {
            return;
        }

        const action = await GetActionInfo(e.user_id);
        const point = (await GetAllSpot()).find(spot => spot.x == action.x && spot.y == action.y);
        const position = (await GetAllArea()).find(item => inRange(action.x, item.x1, item.x2) && inRange(action.y, item.y1, item.y2));
        const msg = [`坐标:(${action.x},${action.y})`];
        if (position) {
            msg.push(`所在区域: ${position.name}`);
        }
        if (point) {
            msg.push(`所在地点: ${point.name}`);
        }
        ForwardMsg(e, msg);
    }

    GoTo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canMove)) {
            return;
        }

        const address = e.msg.replace('#前往', '');
        const point = (await GetAllSpot()).find(item => item.name == address);
        if (!point) {
            e.reply(`无法前往${address}!`);
            return;
        }

        const action = await GetActionInfo(e.user_id);
        const distance = Math.abs(action.x - point.x) + Math.abs(action.y - point.y);
        const speed = await GetSpeed(e.user_id);
        const timeCost = Math.floor(distance * (1 - speed * 0.01)) + 1;

        isMoving[e.user_id] = setTimeout(async () => {
            const [_, regionId, addressId] = point.id.split('-');
            action.x = point.x;
            action.y = point.y;
            action.region = regionId;
            action.address = addressId;
            SetActionInfo(e.user_id, action);
            e.reply([segment.at(e.user_id), `成功抵达${address}`]);
        }, timeCost * 1000); //参数是ms，所以*1000

        redis.setEx(`xiuxian:player:${e.user_id}:moving`, timeCost, `正在前往${address}`);

        e.reply(`正在前往${address}...\n需要${timeCost}秒`);
    }

    Teleport = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canMove)) {
            return;
        }

        const address = e.msg.replace('#传送', '');
        const position = (await GetAllArea()).find(item => item.name == address);
        if (position == undefined) {
            e.reply(`无法传送${address}!`);
            return;
        }

        const action = await GetActionInfo(e.user_id);
        const inPortal = await IfAtSpot(e.user_id, '传送阵');           //是否在传送阵
        const Scroll = await GetItemByName(e.user_id, '传送卷轴');      //是否有传送卷轴

        if (!inPortal && Scroll == undefined) {
            e.reply('请前往传送阵或者使用传送卷轴！');
            return;
        }

        const wealth = await GetSpiritStoneCount(e.user_id);
        const cost = 1000;
        if (wealth == undefined || wealth < cost) {
            e.reply(`传送需要花费${cost}灵石`);
            return;
        }
        AddSpiritStone(e.user_id, -cost);


        if (!inPortal) { //不在传送点， 消耗传送卷轴
            AddItemByObj(e.user_id, Scroll, -1);
        }

        const target = {
            "x": rand(position.x1, position.x2),
            "y": rand(position.y1, position.y2)
        }
        const distance = Math.abs(action.x - target.x) + Math.abs(action.y - target.y);
        const timeCost = Math.floor(distance / 100) + 1;
        isMoving[e.user_id] = setTimeout(async () => {
            const [_, regionId, addressId] = position.id.split('-');
            action.x = target.x;
            action.y = target.y;
            action.region = regionId;
            action.address = addressId;
            SetActionInfo(e.user_id, action);
            e.reply([segment.at(e.user_id), `成功传送至${address}`]);
        }, 1000 * timeCost); //参数是ms，所以*1000

        redis.setEx(`xiuxian:player:${e.user_id}:moving`, timeCost, `正在前往${address}`);

        e.reply(`传送${address}\n需要${timeCost}秒`);
    }
}