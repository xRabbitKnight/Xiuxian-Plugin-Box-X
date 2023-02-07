import { GetItemObj } from '../../../model/Cache/item/Item.js'

/**
 * @description: 通过名字过滤物品
 * @param {string} name 物品名称，可能是物品类别名称
 * @param {[]} gallery 所有物品
 * @return {Promise<{included:[], excluded:[]}>} 符合名称的物品列表，被滤除的物品列表
 */
export async function filterItemsByName(name, gallery) {
	var included = [], excluded = [];
	if (gallery) {
		let idReg = await getIdReg(name);
		gallery.forEach(item => {
			if (idReg.test(item.id)) {
				included.push(item);
			} else {
				excluded.push(item);
			}
		})
	}
	return { included, excluded };
}

/**
 * @description: 融合物品列表
 * @param {[]} itemLists 物品列表数组
 * @return {[]} 物品列表数组融合结果
 */
export function mergeItems(...itemLists) {
	let result = [];
	itemLists.forEach(itemList => {
		itemList.forEach(item => {
			let slot = result.find(_item => _item.id == item.id);
			if (slot == undefined) {
				result.push(item);
			} else {
				slot.acount += item.acount;
			}
		})
	});
	return result;
}

/**
 * @description: 生成物品列表消息
 * @param {string} preMsg 消息列表第一个消息
 * @param {[]} items 物品列表数组
 * @return {[]} 物品列表消息
 */
export function listItems(preMsg, items) {
	let msgList = [preMsg];
	items.forEach(item => {
		msgList.push(`${item.name} * ${item.acount}`)
	});
	return msgList;
}

async function getIdReg(name) {
	switch (name) {
		case '武器':
			return /^1-/;
		case '护具':
			return /^2-/;
		case '法宝':
			return /^3-/;
		case '装备':
			return /^[123]-/;
		case '恢复药':
			return /^4-1-/;
		case '修为药':
			return /^4-2-/;
		case '气血药':
			return /^4-3-/;
		case '丹药':
			return /^4-/;
		case '功法':
			return /^5-/;
		case '道具':
			return /^6-/;
		case '技能书':
			return /^7-/;
		case '全部物品':
			return /.+/;
		default:
			const ITEM = await GetItemObj(name, 1);
			return new RegExp(`^${ITEM ? ITEM.id : ''}$`);
	}
}