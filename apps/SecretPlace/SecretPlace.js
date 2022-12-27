import plugin from '../../../../lib/plugins/plugin.js';
import data from '../../model/XiuxianData.js';
import fs from 'node:fs';
import { segment } from 'oicq';
import { Read_action, ForwardMsg, Write_action, exist_najie_thing_id, Add_najie_thing, Read_najie, Write_najie } from '../Xiuxian/Xiuxian.js';
import { CheckStatu, StatuLevel } from '../../model/Statu/Statu.js';
import { inRange, rand } from '../../model/mathCommon.js';
import { AddSpiritStone, GetSpiritStoneCount } from '../../model/Cache/player/Backpack.js';
import { GetSpeed } from '../../model/Cache/player/Battle.js';

const isMoving = [];
export class SecretPlace extends plugin {
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
    };

    ShowCity = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inGroup)) {
            return;
        }

        const action = await Read_action(e.user_id);
        if (action.address != 1) {
            e.reply('你对这里并不了解...');
            return;
        }

        const addressId = `${action.z}-${action.region}-${action.address}`;
        const points = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`)).filter(item => item.id.includes(addressId));
        const msg = [];
        points.forEach(point => msg.push(`地点名:${point.name}\n坐标:(${point.x},${point.y})`));
        await ForwardMsg(e, msg);
    };

    GoBack = async (e) => {
        if (!await CheckStatu(e, StatuLevel.inAction)) {
            return;
        }

        redis.del(`xiuxian:player:${e.user_id}:moving`);
        clearTimeout(isMoving[e.user_id]);
        e.reply('你回到了原地');
    };

    ShowCoordinate = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canMove)) {
            return;
        }

        const action = await Read_action(e.user_id);
        const point = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`)).find(item => item.x == action.x && item.y == action.y);
        const position = JSON.parse(fs.readFileSync(`${data.__PATH.position}/position.json`)).find(item => inRange(action.x, item.x1, item.x2) && inRange(action.y, item.y1, item.y2));
        const msg = [`坐标:(${action.x},${action.y})`];
        if (position) {
            msg.push(`所在区域: ${position.name}`);
        }
        if (point) {
            msg.push(`所在地点: ${point.name}`);
        }

        await ForwardMsg(e, msg);
    };

    GoTo = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canMove)) {
            return;
        }

        const address = e.msg.replace('#前往', '');
        const point = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`)).find(item => item.name == address);
        if (!point) {
            await e.reply(`地图上没有${address}!`);
            return;
        }

        const action = await Read_action(e.user_id);
        const distance = Math.abs(action.x - point.x) + Math.abs(action.y - point.y);
        const speed = await GetSpeed(e.user_id);
        const timeCost = Math.floor(distance * (1 - speed * 0.01)) + 1;

        isMoving[e.user_id] = setTimeout(async () => {
            const [_, regionId, addressId] = point.id.split('-');
            action.x = point.x;
            action.y = point.y;
            action.region = regionId;
            action.address = addressId;
            await Write_action(e.user_id, action);
            e.reply([segment.at(e.user_id), `成功抵达${address}`]);
        }, timeCost * 1000); //参数是ms，所以*1000

        redis.setEx(`xiuxian:player:${e.user_id}:moving`, timeCost,`正在前往${address}`);

        e.reply(`正在前往${address}...\n需要${timeCost}秒`);
    };

    Teleport = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canMove)) {
            return;
        };

        const address = e.msg.replace('#传送', '');
        const position = JSON.parse(fs.readFileSync(`${data.__PATH.position}/position.json`)).find(item => item.name == address);
        if (!position) {
            e.reply(`地图上没有${address}!`);
            return;
        };

        const action = await Read_action(e.user_id);
        const point = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`)).find(item => item.x == action.x && item.y == action.y);
        const inPortal = point?.id.split('-')[4] == 2;                                 //是否在传送阵
        const haveScroll = (await exist_najie_thing_id(e.user_id, "6-1-3")) != 1;      //是否有传送卷轴

        if (!inPortal && !haveScroll) {
            e.reply('请前往传送阵或者使用传送卷轴！');
            return;
        };

        const wealth = await GetSpiritStoneCount(e.user_id);
        const cost = 1000;
        if (wealth != undefined && wealth < cost) {
            e.reply(`传送需要花费${cost}灵石`);
            return;
        };
        AddSpiritStone(_e.user_id, -cost);
        

        if (!inPortal) { //不在传送点， 消耗传送卷轴
            let najie = await Read_najie(e.user_id);
            najie = await Add_najie_thing(najie, {"id" : "6-1-3"}, -1);
            await Write_najie(e.user_id, najie);
        }

        const target = { 
            "x": rand(position.x1, position.x2), 
            "y": rand(position.y1, position.y2) 
        };
        const distance = Math.abs(action.x - target.x) + Math.abs(action.y - target.y);
        const timeCost = Math.floor(distance / 100) + 1;
        isMoving[e.user_id] = setTimeout(async () => {
            const [_, regionId, addressId] = position.id.split('-');
            action.x = target.x;
            action.y = target.y;
            action.region = regionId;
            action.address = addressId;
            await Write_action(e.user_id, action);
            e.reply([segment.at(e.user_id), `成功传送至${address}`]);
        }, 1000 * timeCost); //参数是ms，所以*1000

        redis.setEx(`xiuxian:player:${e.user_id}:moving`, timeCost,`正在前往${address}`);

        e.reply(`传送${address}\n需要${timeCost}秒`);
        return;
    };
};