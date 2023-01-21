import { Monster } from "../../../../model/Monster/Monster.js";

export class Nian extends Monster{
    constructor(){
        super(10);

        //修改属性
        this.name = `年兽`;
        this.battleInfo.blood = 10000000;
        this.battleInfo.nowblood = this.battleInfo.blood;
        this.battleInfo.attack = 0;
        this.battleInfo.defense = 0;
        this.battleInfo.speed = 0;
        this.dropTip = 'nian';
    }
}