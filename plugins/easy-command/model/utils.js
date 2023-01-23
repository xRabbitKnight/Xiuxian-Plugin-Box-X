import { GetItemByName } from '../../../model/Cache/item/Item.js'

/**
 * @description: 通过名字过滤物品
 * @param {string} name 物品名称，可能是物品类别名称
 * @param {[]} gallery 所有物品
 * @return {{included:[], excluded:[]}} 符合名称的物品列表，被滤除的物品列表
 */
export function filterItemsByName(name, gallery) {
	var included = [], excluded = [];
	if (gallery) {
		let idReg = getIdReg(name)
		gallery.forEach(item => {
			if (item.id.test(idReg)) {
				included.append(item);
			} else {
				excluded.append(item);
			}
		})
	}
	return {included, excluded}
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
				result.append(item)
			} else {
				slot.acount += item.acount;
			}
		})
	});
	return result;
}

function getIdReg(name) {
	switch(itemName) {
		case '武器':
			return /^1-/
		case '护具':
			return /^2-/
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
		case '技能书':
			return /^7-/;
		case '全部物品':
			return /.+/;
		default:
			const ITEM = GetItemByName(name, 1);
			return new RegExp(`^${ITEM.id}$`);
	}
}