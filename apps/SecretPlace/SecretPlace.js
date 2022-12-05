import plugin from '../../../../lib/plugins/plugin.js';
import data from '../../model/XiuxianData.js';
import fs from 'node:fs';
import { segment } from 'oicq';
import { Go, Read_action, Read_level, ForwardMsg,existplayer, Read_wealth, Write_action, Write_wealth, Read_battle, exist_najie_thing_id, Add_najie_thing, Read_najie, Write_najie } from '../Xiuxian/Xiuxian.js';
const forwardsetTime = []
const deliverysetTime = [];
const useraction = [];
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
                    fnc: 'xyzaddress'
                },
                {
                    reg: '^#前往.*$',
                    fnc: 'forward'
                },
                {
                    reg: '^#回到原地$',
                    fnc: 'returnpoint'
                },
                {
                    reg: '^#传送.*$',
                    fnc: 'delivery'
                },
                {
                    reg: '^#位置信息$',
                    fnc: 'show_city'
                }
            ]
        });
    };
    show_city = async (e) => {
        if (!e.isGroup) {
            return;
        };
        const usr_qq = e.user_id;
        const ifexistplay = await existplayer(usr_qq);
        if (!ifexistplay) {
            return;
        };
        const action=await Read_action(usr_qq);
        if(action.address!=1){
            e.reply('你对这里并不了解...');
            return;
        };
        const addressId=`${action.z}-${action.region}-${action.address}`;
        const point = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`));
        const address=[];
        const msg=[];
        point.forEach((item)=>{
            if(item.id.includes(addressId)){
                address.push(item);
            };
        });
        address.forEach((item)=>{
            msg.push(`地点名:${item.name}\n坐标(${item.x},${item.y})`)
        });
        await ForwardMsg(e,msg);
        return;
    };
    returnpoint = async (e) => {
        const good = await Go(e);
        if (!good) {
            return;
        };
        const usr_qq = e.user_id;
        forwardsetTime[usr_qq] = 0;
        clearTimeout(useraction[usr_qq]);
        e.reply('你回到了原地');
        return;
    };
    xyzaddress = async (e) => {
        if (!e.isGroup) {
            return;
        };
        const usr_qq = e.user_id;
        const ifexistplay = await existplayer(usr_qq);
        if (!ifexistplay) {
            return;
        };
        const action = await Read_action(usr_qq);
        const point = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`)).find(item => item.x == action.x && item.y == action.y);
        const position = JSON.parse(fs.readFileSync(`${data.__PATH.position}/position.json`)).find(item => item.x1 <= action.x && item.y1 <= action.y && item.x2 >= action.x && item.y2 >= action.y);
        const msg = [
            `坐标(${action.x},${action.y},${action.z})`
        ]
        if (position) {
            msg.push(`所在区域: ${position.name}`);
        };
        if (point) {
            msg.push(`所在地点: ${point.name}`);
        };
        await ForwardMsg(e, msg);
        return;
    };
    forward = async (e) => {
        const good = await Go(e);
        if (!good) {
            return;
        };
        const usr_qq = e.user_id;
        if (forwardsetTime[usr_qq] == 1) {
            return;
        };
        const action = await Read_action(usr_qq);
        const x = action.x;
        const y = action.y;
        const address = e.msg.replace('#前往', '');
        const point = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`)).find(item => item.name == address);
        if (!point) {
            return;
        };
        const mx = point.x;
        const my = point.y;
        const PointId = point.id.split('-');
        const level = await Read_level(usr_qq);
        if (level.level_id < PointId[3]) {
            e.reply('[修仙联盟]守境者\n道友请留步');
            return;
        };
        const a = x - mx >= 0 ? x - mx : mx - x;
        const b = y - my >= 0 ? y - my : my - y;
        const battle = await Read_battle(usr_qq);
        const the = Math.floor((a + b)-(a + b)*battle.speed*0.01);
        const time = the >= 0 ? the : 1;
        useraction[usr_qq] = setTimeout(async () => {
            forwardsetTime[usr_qq] = 0;
            action.x = mx;
            action.y = my;
            action.region = PointId[1];
            action.address = PointId[2];
            await Write_action(usr_qq, action);
            e.reply([segment.at(usr_qq), `成功抵达${address}`]);
        }, 1000 * time);
        forwardsetTime[usr_qq] = 1;
        e.reply(`正在前往${address}...\n需要${time}秒`);
        return;
    };
    delivery = async (e) => {
        const good = await Go(e);
        if (!good) {
            return;
        };
        const usr_qq = e.user_id;
        if (deliverysetTime[usr_qq] == 1) {
            return;
        };
        const action = await Read_action(usr_qq);
        const x = action.x;
        const y = action.y;
        const address = e.msg.replace('#传送', '');
        const position = JSON.parse(fs.readFileSync(`${data.__PATH.position}/position.json`)).find(item => item.name == address);
        if (!position) {
            return;
        };
        const positionID = position.id.split('-');
        const level = await Read_level(usr_qq);
        if (level.level_id < positionID[3]) {
            e.reply('[修仙联盟]守境者\n道友请留步');
            return;
        };
        const point = JSON.parse(fs.readFileSync(`${data.__PATH.position}/point.json`));
        let key = 0;
        point.forEach((item) => {
            if (item.id.split('-')[4] == 2 && item.x == x && item.y == y)
                key = 1;
        });

        const najie_scroll = await exist_najie_thing_id(usr_qq, "6-1-3");
        if (key == 0 && najie_scroll == 1) {
            await e.reply('请前往传送阵或者使用传送卷轴！');
            return;
        };

        const wealth = await Read_wealth(usr_qq);
        const lingshi = 1000;
        if (wealth.lingshi < lingshi) {
            e.reply(`[修仙联盟]守阵者\n需要花费${lingshi}灵石`);
            return;
        };
        wealth.lingshi -= lingshi;
        await Write_wealth(usr_qq, wealth);
        if(key == 0){ //不在传送点， 消耗传送卷轴
            let najie = await Read_najie(usr_qq);
            najie = await Add_najie_thing(najie, najie_scroll, -1);
            await Write_najie(usr_qq, najie);
        }   
        const mx = Math.floor((Math.random() * (position.x2 - position.x1))) + Number(position.x1);
        const my = Math.floor((Math.random() * (position.y2 - position.y1))) + Number(position.y1);
        const the = Math.floor(((x - mx >= 0 ? x - mx : mx - x) + (y - my >= 0 ? y - my : my - y)) / 100);
        const time = the > 0 ? the : 1;
        setTimeout(async () => {
            deliverysetTime[usr_qq] = 0;
            action.x = mx;
            action.y = my;
            action.region = positionID[1];
            action.address = positionID[2];
            await Write_action(usr_qq, action);
            e.reply([segment.at(usr_qq), `成功传送至${address}`]);
        }, 1000 * time);
        deliverysetTime[usr_qq] = 1;
        e.reply(`[修仙联盟]守阵者\n传送${address}\n需要${time}秒`);
        return;
    };
};