import data from "../System/data.js";
import { ReadSync } from "../../../../model/File/File.js";

const filePath = data.__pluginDataPath.shop;
const redisKey = 'xiuxian:plugin:shop'

/** ***** 
 * @description: 获取商店货物信息, 若没有则读文件, 读文件失败返回undefined
 * @return {Promise<[]>} 返回的对应信息 JSON对象 物品信息数组
 */
export async function GetCommodities() {
    let value = await redis.get(redisKey);
    if (value == null) {
        value = ReadSync(filePath);
        if (value == undefined) return undefined;

        redis.set(redisKey, value);
    }
    return JSON.parse(value);
}

/******* 
 * @description: 设置全部商店货物
 * @param {JSON} _commodities 待更新的商店货物
 * @return 无返回值
 */
export async function SetCommodities(_commodities) {
    redis.set(redisKey, JSON.stringify(_commodities));
}