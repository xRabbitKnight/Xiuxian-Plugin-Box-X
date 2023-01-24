import Shop from "./apps/Shop.js";
import data from "../../model/System/data.js";

export function dataInit(){
    data.AddCmdCfg({
        group: '修仙插件',
        list: [
            {
                icon: 'help-icon_14',
                title: '#修仙插件帮助',
                desc: '查看修仙插件帮助指令'
            }
        ]
    });    
}

export function gameInit(){
    new Shop().RefreshShop();
}