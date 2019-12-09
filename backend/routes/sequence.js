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

const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const config = require("../config");
const utils = require("../utils");
const multer = require("multer");
const Sequence = require("../models/sequence");

/**
 * @apiDefine Sequences Sequences
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

router.get("/sequences/:sequenceId", middlewares.issue.canView, findSequenceById);
router.get("/sequences", middlewares.issue.canView, listSequences);
router.get("/revision/:rid/sequences", middlewares.issue.canView, listSequences);

function listSequences(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, rid } = req.params;
	const branch = rid ? null : "master";

	Sequence.getList(account, model, branch, rid, true).then(sequences => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, sequences);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findSequenceById(req, res, next) {
	const params = req.params;
	const place = utils.APIInfo(req);
	const {account, model} =  req.params;

	Sequence.findByUID(account, model, params.sequenceId, true).then(sequence => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, sequence);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;