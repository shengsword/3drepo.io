/**
 *  Copyright (C) 2018 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const utils = require("../utils");
const uuid = require("node-uuid");
const responseCodes = require("../response_codes.js");
const db = require("../db/db");

const view = {};

// viewSchema = {
// 	_id: Object,
// 	name: String,
// 	clippingPlanes : [Schema.Types.Mixed ],
// 	viewpoint: {
// 		position: [Number],
// 		up: [Number],
// 		look_at: [Number],
// 		view_dir: [Number],
// 		right: [Number]
// 	},
// 	screenshot: {
// 		buffer : Object,
// 		thumbnail: String,
// 	}
// };

view.findByUID = function(dbCol, uid){

	return db.getCollection(dbCol.account, dbCol.model + ".views").then((_dbCol) => {
		return _dbCol.findOne({ _id: utils.stringToUUID(uid) }).then(view => {

			if (!view) {
				return Promise.reject(responseCodes.VIEW_NOT_FOUND);
			}

			return view;
		});
	});
};

view.listViews = function(dbCol){

	const query = {};

	return db.getCollection(dbCol.account, dbCol.model + ".views").then(_dbCol => {
		return _dbCol.find(query).toArray().then(results => {
			results.forEach((result) => {
				result._id = utils.uuidToString(result._id);
				if (result.screenshot.buffer) {
					delete result.screenshot.buffer;
				}
			});
			return results;
		});
	});

};

view.getThumbnail = function(dbColOptions, uid){

	return this.findByUID(dbColOptions, uid).then(view => {
		if(!view.screenshot || !view.screenshot.buffer || !view.screenshot.buffer.buffer){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			// Mongo stores it as it's own binary object, so we need to do buffer.buffer!
			return view.screenshot.buffer.buffer;
		}
	});

};

view.updateAttrs = function(dbCol, id, data){

	const toUpdate = {};
	const fieldsCanBeUpdated = ["name", "clippingPlanes", "viewpoint", "screenshot"];
	let cropped;

	if (data.screenshot.base64) {
		cropped = utils.getCroppedScreenshotFromBase64(data.screenshot.base64, 120, 120);
	} else {
		cropped = Promise.resolve();
	}
	
	const updated = cropped.then((croppedScreenshot) => {

		if (croppedScreenshot) {
			// Remove the base64 version of the screenshot
			delete data.screenshot.base64;
			data.screenshot.buffer = new Buffer.from(croppedScreenshot, "base64");
		}

		// Set the data to be updated in Mongo
		fieldsCanBeUpdated.forEach((key) => {
			if (data[key]) {
				toUpdate[key] = data[key];
			}
		});

	});

	return updated.then(() => {
		return db.getCollection(dbCol.account, dbCol.model + ".views").then(_dbCol => {
			return _dbCol.update({_id: id}, {$set: toUpdate}).then(() => {
				return {_id: utils.uuidToString(id)};
			}); 
		});
	});
	
};

view.createView = function(dbCol, data){
	return db.getCollection(dbCol.account, dbCol.model + ".views").then((_dbCol) => {
		const id = utils.stringToUUID(uuid.v1());
		return _dbCol.insert({ _id: id }).then(() => {
			const cropped = utils.getCroppedScreenshotFromBase64(data.screenshot.base64, 120, 120);

			return cropped.then((croppedScreenshot) => {

				const thumbnailUrl = `${dbCol.account}/${dbCol.model}/views/${utils.uuidToString(id)}/thumbnail.png`;

				// Remove the base64 version of the screenshot
				delete data.screenshot.base64; 
				data.screenshot.buffer = new Buffer.from(croppedScreenshot, "base64");
				data.screenshot.thumbnail = thumbnailUrl;

				return this.updateAttrs(dbCol, id, data).catch((err) => {
					// remove the recently saved new view as update attributes failed
					return this.deleteView(dbCol, id).then(() => {
						return Promise.reject(err);
					});
				});
			});
		});
	});
};

view.deleteView = function(dbCol, id){

	if ("[object String]" === Object.prototype.toString.call(id)) {
		id = utils.stringToUUID(id);
	}

	return db.getCollection(dbCol.account, dbCol.model + ".views").then((_dbCol) => {
		return _dbCol.findOneAndDelete({ _id : id}).then((deleteResponse) => {
			if(!deleteResponse.value) {
				return Promise.reject(responseCodes.VIEW_NOT_FOUND);
			}
		});
	});
};

module.exports = view;
