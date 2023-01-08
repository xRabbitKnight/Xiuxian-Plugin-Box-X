import plugin from '../../../../lib/plugins/plugin.js';
//import data from '../../model/XiuxianData.js';
import fs from 'fs';
import { segment } from 'oicq';
import { existplayer, __PATH, Write_player, get_talent, Write_najie, Write_talent, Write_battle, Write_level, Write_wealth, player_efficiency, Write_action, Write_equipment, Write_Life, Read_Life, offaction, Anyarray } from '../Xiuxian/Xiuxian.js';
import { CheckCD } from '../../model/CD/CheckCD.js';
import { AddActionCD } from '../../model/CD/AddCD.js';
export class UserStart extends plugin {
    constructor() {
        super({
            name: 'UserStart',
            dsc: 'UserStart',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: '^#降临世界$',
                    fnc: 'Create_player'
                },
                {
                    reg: '^#再入仙途$',
                    fnc: 'reCreate_player'
                },
                {
                    reg: '^#联盟报到$',
                    fnc: 'New_lingshi'
                }
            ]
        });
    }

    New_lingshi = async (e) => {
        if (!await CheckStatu(e, StatuLevel.canGive)) {
            return;
        };

        if (!await IfAtSpot(e.user_id, '联盟')) {
            e.reply(`需回联盟`);
            return;
        }

        const usr_qq = e.user_id;
        const level = await Read_level(usr_qq);
        if (level.level_id != 1) {
            return;
        };
        if (action.newnoe != 1) {
            return;
        };
        action.newnoe = 0;
        await Write_action(usr_qq, action);
        const equipment_name = '烂铁匕首';
        const money = Number(5);
        const ifexist = JSON.parse(fs.readFileSync(`${data.__PATH.all}/all.json`)).find(item => item.name == equipment_name);
        let najie = await Read_najie(usr_qq);
        najie = await Add_najie_thing(najie, ifexist, Number(1));
        await Write_najie(usr_qq, najie);
        await Add_lingshi(usr_qq, money);
        e.reply(`[修仙联盟]方正\n看你骨骼惊奇\n就送你一把[${equipment_name}]吧\n还有这${money}灵石\n可在必要的时候用到`);
        e.reply(`你对此高兴万分\n把[${equipment_name}]放进了#储物袋`)
        return;
    };
    
    Create_player = async (e) => {
        if (!e.isGroup || e.user_id == 80000000) {
            return;
        };
        const usr_qq = e.user_id;
        const ifexistplay = await existplayer(usr_qq);
        if (ifexistplay) {
            this.Show_player(e);
            return;
        };
        const new_player = {
            'autograph': '无',//道宣
            'days': 0//签到
        };
        const new_battle = {
            'nowblood': data.Level_list.find(item => item.id == 1).blood + data.LevelMax_list.find(item => item.id == 1).blood,//血量
        };
        const new_level = {
            'prestige': 0,//魔力
            'level_id': 1,//练气境界
            'levelname': '凡人',//练气名
            'experience': 1,//练气经验
            'levelmax_id': 1,//练体境界
            'levelnamemax': '莽夫',//练体名
            'experiencemax': 1,//练体经验
            'rank_id': 0,//数组位置
            'rank_name': [
                '初期', '中期', '后期', '巅峰', '圆满'
            ],
            'rankmax_id': 0//数组位置
        };
        const new_wealth = {
            'lingshi': 0,
            'xianshi': 0
        };
        const position = JSON.parse(fs.readFileSync(`${data.__PATH.position}/position.json`)).find(item => item.name == '极西');
        const positionID = position.id.split('-');
        const the = {
            mx: Math.floor((Math.random() * (position.x2 - position.x1))) + Number(position.x1),
            my: Math.floor((Math.random() * (position.y2 - position.y1))) + Number(position.y1)
        };
        const new_action = {
            'game': 1,//游戏状态
            'Couple': 1, //双修
            'newnoe': 1, //新人
            'x': the.mx,
            'y': the.my,
            'z': positionID[0],//位面 
            'region': positionID[1],//区域
            'address': positionID[2],//属性
            'Exchange': 0
        };
        const new_najie = {
            'grade': 1,
            'lingshimax': 50000,
            'lingshi': 0,
            'thing': []
        };
        const newWarehouse = {
            'items': []
        };
        const newtalent = await get_talent();
        const new_talent = {
            'talent': newtalent,//灵根
            'talentshow': 1,//显示0,隐藏1
            'talentsize': 0,//天赋
            'AllSorcery': []//功法
        };
        const thename = {
            name1: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
            name2: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        };
        const name = await Anyarray(thename.name1) + await Anyarray(thename.name2);
        const life = await Read_Life();
        const time = new Date();
        life.push({
            'qq': usr_qq,
            'name': `${name}`,
            'Age': 1,//年龄
            'life': Math.floor((Math.random() * (100 - 50) + 50)), //寿命
            'createTime': time.getTime(),
            'status': 1
        });
        await Write_player(usr_qq, new_player);
        await Write_talent(usr_qq, new_talent);
        await player_efficiency(usr_qq);
        await Write_battle(usr_qq, new_battle);
        await Write_level(usr_qq, new_level);
        await Write_wealth(usr_qq, new_wealth);
        await Write_action(usr_qq, new_action);
        await Write_equipment(usr_qq, []);
        await Write_najie(usr_qq, new_najie);
        await writeWarehouse(usr_qq, newWarehouse);
        await Write_Life(life);
        e.reply(`你来到一个修仙世界\n你对修仙充满了好奇\n你可以#前往极西联盟\n进行#联盟报到\n会得到[修仙联盟]的帮助\n更快的成为练气修士\n也可以#基础信息\n查看自己的身世\n若想快速去往天山\n建议#前往极西传送阵\n进行#传送天山`);
        return;
    };
    
    reCreate_player = async (e) => {
        const usr_qq = e.user_id;
        if(CheckCD(e, 'reBorn')){
            return ;
        }
        await offaction(usr_qq);
        fs.rmSync(`${__PATH.player}/${usr_qq}.json`);
        let life = await Read_Life();
        life = await life.filter(item => item.qq != usr_qq);
        await Write_Life(life);
        e.reply([segment.at(usr_qq), '来世,信则有,不信则无,岁月悠悠,世间终会出现两朵相同的花,千百年的回眸,一花凋零,一花绽。是否为同一朵,任后人去评断']);
        await this.Create_player(e);
        await AddActionCD(e, 'reBorn');
        return;
    };
};