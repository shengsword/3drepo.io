/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.ap
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const db = require("../handler/db");
const utils = require("../utils");

class Task {

	clean(toClean, targetType = "[object String]") {
		const keys = ["_id", "shared_ids"];

		keys.forEach((key) => {
			if (toClean[key] && "[object String]" === targetType) {
				if ("[object Object]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = utils.uuidToString(toClean[key]);
				} else if ("[object Array]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = toClean[key].map((elem) => utils.uuidToString(elem));
				}
			} else if (toClean[key] && "[object Object]" === targetType) {
				if ("[object String]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = utils.stringToUUID(toClean[key]);
				} else if ("[object Array]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = toClean[key].map((elem) => utils.stringToUUID(elem));
				}
			}
		});

		return toClean;
	}

	async findByUID(account, model, taskId, cleanResponse = false) {
		return db.getCollection(account, model + ".tasks").then((_dbCol) => {
			return _dbCol.findOne({ _id: utils.stringToUUID(taskId) }).then(task => {

				if (!task) {
					return Promise.reject(responseCodes.TASK_NOT_FOUND);
				}

				if (cleanResponse) {
					this.clean(task);
				}

				return task;
			});
		});
	}
}

module.exports = new Task();
