import Monster from "../../../../model/Monster/monster.js";

export class Nian extends Monster {
    constructor() {
        super({
            name: '年兽',
            level: 10,
            dropTip: 'nian',
            battleInfo: {
                blood: 10000000,
                nowblood: 10000000,
                attack: 0,
                defense: 0,
                speed: 0,
                burst: 0,
                burstmax: 0,
            }
        });
    }
}