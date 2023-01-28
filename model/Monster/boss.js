import { rand } from "../util/math.js";
import MonsterMgr from "./mgr.js";
import Monster from "./monster.js";

export default class Boss extends Monster {
    constructor() {
        //先随便构造一个monster
        super({
            dropTip: 'boss',
            delEvent: () => { MonsterMgr.BossCount -= 1; }
        });

        //修改属性
        this.name = `BOSS${this.name}`;
        this.battleInfo.blood = rand(1000000, 5000000) * this.level;
        this.battleInfo.nowblood = this.battleInfo.blood;
        this.battleInfo.defense = 0;
        this.battleInfo.speed = 0;
    }
}