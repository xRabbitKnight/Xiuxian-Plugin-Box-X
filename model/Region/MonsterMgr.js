//管理所有的怪物
class MonsterMgr{
    constructor(){
        if(!MonsterMgr.instance) MonsterMgr.instance = this;
        return MonsterMgr.instance;
    };

    /*按区域储存所有怪物
        key : region
        value : Monster[]
    */
    monsters = {}
    
    /******* 
     * @description: 将怪物添加至对应地区
     * @param {number} _region 待添加的地区号
     * @param {Monster} _monster 怪物实例
     */    
    AddMonster(_region, _monster){
        if(!(_region in this.monsters)) 
            this.monsters[_region] = [];
        _monster.region = _region;
        this.monsters[_region].push(_monster);
    }

    /******* 
     * @description: 删除某个怪物
     * @param {Monster} _monster 怪物实例
     */    
    DeleteMonster(_monster){
        if(!(_monster.region in this.monsters)) 
            return;
        
        const pos = this.monsters[_monster.region].indexOf(_monster);
        if(pos != -1)
            this.monsters[_monster.region].splice(pos, 1);    
    }

    /******* 
     * @description: 返回目标地区所有怪物
     * @param {number} _region 目标地区号
     * @return {Monster[]} 目标地区所有怪物
     */    
    GetMonsters(_region){
        if(!(_region in this.monsters)) 
            this.monsters[_region] = [];
        return this.monsters[_region];
    }

    /******* 
     * @description: 返回目标地区的怪物数量
     * @param {number} _region 目标地区号 
     * @return {number} 对应怪物数量
     */    
    GetMonsterCount(_region){
        if(!(_region in this.monsters)) 
            this.monsters[_region] = [];
        return this.monsters[_region].length;
    }
}
export default new MonsterMgr();