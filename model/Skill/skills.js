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
    _msg.push('使出一招叶落归尘...');
    _msg.push('叶如秋蚁落,落花春不繁,归梦趁飞絮,尘生逍遥注...');
}

export async function 红尘一梦(_uid, _targets, _msg) {
    _msg.push('使出一招红尘一梦...');
    _msg.push('红旆转逶迤,尘埋余斗气,一岸蓼花风,梦中不知梦...');
}

export async function 浮光掠影(_uid, _targets, _msg) {
    _msg.push('使出一招浮光掠影...');
    _msg.push('浮轮初缥缈,光传甲子宵,掠面小东风,影舞步虚风...');
}

export async function 镜花水月(_uid, _targets, _msg) {
    _msg.push('使出一招镜花水月...');
    _msg.push('镜将池作匣,花县弹琴暇,水暗蒹葭雾,月乘残夜出...');
}

export async function 狱火炼魂(_uid, _targets, _msg) {
    _msg.push('使出一招狱火炼魂...');
    _msg.push('狱成收夜烛,火内汞三铢,炼骨同蝉蜕,魂逐东流水...');
}

export async function 天地同寿(_uid, _targets, _msg) {
    _msg.push('使出一招天地同寿...');
    _msg.push('天！！地！！同！！寿！！');
}

export async function 终极伏特狂雷闪(_uid, _targets, _msg) {
    _msg.push('使出一招终极伏特狂雷闪...');
    _msg.push('雷属性真气在你体内聚集，一小段时间后，你将蓄积的强大电流全力撞向对手...');
}

export async function 绚烂缤纷花怒放(_uid, _targets, _msg) {
    _msg.push('使出一招绚烂缤纷花怒放...');
    _msg.push('四周因感受到你体内浓郁的木属性真气而长出花草，花草的生命能量又聚集在你的手中，你将能量轰出...');
}

export async function 风雷鼓舞三千浪(_uid, _targets, _msg) {
    _msg.push('使出一招风雷鼓舞三千浪...');
    _msg.push('周身产生一股能量旋涡，牵引风雷像海浪一般朝对手攻去...');
}

export async function 九霄龙吟惊天变(_uid, _targets, _msg) {
    _msg.push('使出一招九霄龙吟惊天变...');
    _msg.push('跃向空中，凝聚真气，空中云雾洞开，降下一只真气巨龙，吞吐天地...');
}

export async function 封魔追魂烈焰斩(_uid, _targets, _msg) {
    _msg.push('使出一招封魔追魂烈焰斩...');
    _msg.push('火焰真气缠绕上你的武器，挥砍出去，斩邪除恶，熔于烈焰，消于晨曦...');
}

export async function 夤夜对雪长空断(_uid, _targets, _msg) {
    _msg.push('使出一招夤夜对雪长空断...');
    _msg.push('四周温度骤降，周身凝结出许多冰晶锥刺，抬手挥出，冰晶激射而去...');
}

export async function 大地荒芜崩山击(_uid, _targets, _msg) {
    _msg.push('使出一招大地荒芜崩山击...');
    _msg.push('一个马步向前，腰马和一，以自身真气为引，牵动大地的力量聚集于你的拳头之上，然后踏步向前，振拳出击...');
}

export async function 八卦游龙惊风破(_uid, _targets, _msg) {
    _msg.push('使出一招八卦游龙惊风破...');
    _msg.push('浓缩的风暴之力，在周身凝成一条风龙，挥掌击出，风龙破空而去...');
}

export async function 极烈之枪(_uid, _targets, _msg) {
    _msg.push('使出一招极烈之枪...');
    _msg.push('真气凝聚在你掌尖，浓缩成一个点，快步刺出，极烈极快，以掌尖刺出一条破除一切的直线...');
}

export async function 万法归一(_uid, _targets, _msg) {
    _msg.push('使出一招万法归一...');
    _msg.push('大道至简，衍化至繁，万变不离其宗，一生二，二生三，三生万物，万法归一！');
}