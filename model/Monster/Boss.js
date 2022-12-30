import { rand } from "../mathCommon.js";
import { Monster } from "./Monster.js";

const MaxLevel = 11, MinLevel = 1;
const BloodBase = rand(1000000, 5000000);

export class Boss extends Monster{
    constructor(){
        //先随便构造一个monster
        super(rand(MinLevel, MaxLevel));

        //修改属性
        this.name = `BOSS${this.name}`;
        this.battleInfo.blood = BloodBase * this.level;
        this.battleInfo.nowblood = this.battleInfo.blood;
        this.battleInfo.defense = 0;
        this.battleInfo.speed = 0;
    }
}