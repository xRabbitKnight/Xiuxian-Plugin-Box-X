import path from 'path'

export const CONFIG = {
	yunzaiPath: path.resolve(),
	xiuxianPath: path.join(path.resolve(), 'plugins', 'Xiuxian-Plugin-Box'),
	xiuxianPluginPath: path.join(path.resolve(), 'plugins', 'Xiuxian-Plugin-Box', 'plugins', 'easy-command'),

    resPath: path.join(path.resolve(), 'plugins', 'Xiuxian-Plugin-Box', 'plugins', 'easy-command', 'resources'),
}

export function dataInit(){
    data.AddCmdCfg({
        group: '修仙插件',
        list: [
            {
                icon: 'help-icon_93',
                title: '#快捷帮助',
                desc: '查看快捷指令插件帮助'
            }
        ]
    });
}

export function gameInit(){
    
}