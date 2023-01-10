/**
 * 技能实现统一如下, 请保持技能名与方法名一致，方便通过技能名直接调用方法
 * 此处技能只实现特殊效果以及加入msg，技能额外伤害在调用时获取玩家技能power即可 
 * 
 *  _uid string 为释放者uid
 *  _targets [] 为受到技能效果的所有目标
 *  _msg [] 该场战斗msg, 可将技能效果描述加入
 *  无返回值 
 *  export async function xxx(_uid, _targets, _msg){ 
 *      xxx技能效果
 *  }
 */


export async function 叶落归尘(_uid, _targets, _msg) {
    _msg.push('你使出一招叶落归尘...');
    _msg.push('叶如秋蚁落,落花春不繁,归梦趁飞絮,尘生逍遥注...');
}

export async function 红尘一梦(_uid, _targets, _msg) {
    _msg.push('你使出一招红尘一梦...');
    _msg.push('红旆转逶迤,尘埋余斗气,一岸蓼花风,梦中不知梦...');
}

export async function 浮光掠影(_uid, _targets, _msg) {
    _msg.push('你使出一招浮光掠影...');
    _msg.push('浮轮初缥缈,光传甲子宵,掠面小东风,影舞步虚风...');
}

export async function 镜花水月(_uid, _targets, _msg) {
    _msg.push('你使出一招镜花水月...');
    _msg.push('镜将池作匣,花县弹琴暇,水暗蒹葭雾,月乘残夜出...');
}

export async function 狱火炼魂(_uid, _targets, _msg) {
    _msg.push('你使出一招狱火炼魂...');
    _msg.push('狱成收夜烛,火内汞三铢,炼骨同蝉蜕,魂逐东流水...');
}

export async function 天地同寿(_uid, _targets, _msg) {
    _msg.push('你使出一招天地同寿...');
    _msg.push('天！！地！！同！！寿！！');
}

export async function 终极伏特狂雷闪(_uid, _targets, _msg) {
    _msg.push('你使出一招终极伏特狂雷闪...');
}

export async function 绚烂缤纷花怒放(_uid, _targets, _msg) {
    _msg.push('你使出一招绚烂缤纷花怒放...');
}

export async function 风雷鼓舞三千郎(_uid, _targets, _msg) {
    _msg.push('你使出一招风雷鼓舞三千郎...');
}

export async function 九霄龙吟惊天变(_uid, _targets, _msg) {
    _msg.push('你使出一招九霄龙吟惊天变...');
}

export async function 封魔追魂烈焰斩(_uid, _targets, _msg) {
    _msg.push('你使出一招封魔追魂烈焰斩...');
}

export async function 夤夜对雪长空断(_uid, _targets, _msg) {
    _msg.push('你使出一招夤夜对雪长空断...');
}

export async function 大地荒芜崩山击(_uid, _targets, _msg) {
    _msg.push('你使出一招大地荒芜崩山击...');
    _msg.push('一招出，山岩崩坏，大地震颤...');
}

export async function 八卦游龙惊风破(_uid, _targets, _msg) {
    _msg.push('你使出一招八卦游龙惊风破...');
    _msg.push('顿时八方风起,化作龙形,扑向中央...');
}

export async function 极烈之枪(_uid, _targets, _msg) {
    _msg.push('你使出一招极烈之枪...');
    _msg.push('四方烈焰汇集，化为一只长矛飞掷而出...');
}

export async function 万法归一(_uid, _targets, _msg) {
    _msg.push('你使出一招万法归一...');
    _msg.push('万！！法！！归！！一！！');
}