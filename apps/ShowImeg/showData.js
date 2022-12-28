import Show from '../../model/show.js';
import puppeteer from '../../../../lib/puppeteer/puppeteer.js';
import config from '../../model/Config.js';
import { existplayer } from '../Xiuxian/Xiuxian.js';
export class showData extends plugin {
    constructor() {
        super({
            name: 'showData',
            dsc: 'showData',
            event: 'message',
            priority: 600,
            rule: [
            ]
        });
    };
};

const updata = config.getdefSet('version', 'version');
export const get_updata_img = async (e) => {
    const usr_qq = e.user_id;
    const ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        return;
    };
    const myData = {
        version: updata
    };
    const data1 = await new Show(e).get_Data('updata', 'updata', myData);
    const img = await puppeteer.screenshot('updata', {
        ...data1,
    });
    return img;
};

export const get_toplist_img = async (e, list) => {
    const usr_qq = e.user_id;
    const ifexistplay = await existplayer(usr_qq);
    if (!ifexistplay) {
        return;
    };
    const myData = {
        list: list,
    };
    const data1 = await new Show(e).get_Data('toplist', 'toplist', myData);
    const img = await puppeteer.screenshot('toplist', {
        ...data1,
    });
    return img;
};