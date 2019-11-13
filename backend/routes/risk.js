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
const Comment = require("../models/comment");
const Risk = require("../models/risk");
const config = require("../config");
const utils = require("../utils");
const multer = require("multer");

/**
 * @apiDefine Risks Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @api {get} /:teamspace/:model/risks/:riskId Get a risk
 * @apiName findRiskById
 * @apiGroup Risks
 * @apiDescription Retrieve a risk. The response includes all comments
 * and screenshot URLs.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {Object} issue The Issue matching the Issue ID
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * 	"name":"Risk 1",
 * 	"associated_activity":"",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"safetibase_id":"",
 * 	"likelihood":0,
 * 	"consequence":0,
 * 	"residual_likelihood":-1,
 * 	"residual_consequence":-1,
 * 	"mitigation_status":"",
 * 	"mitigation_desc":"",
 * 	"residual_risk":"",
 * 	"owner":"alice",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"desc":"Risk description that describes the risk",
 * 	"creator_role":"Job4",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"norm":[0,0,0],
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"created":1567156228976,
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 * 	"account":"acme",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"viewpoint":{
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"near":600.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"hideIfc":true,
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png"
 * 	},
 * 	"level_of_risk":0,
 * 	"residual_level_of_risk":-1,
 * 	"overall_level_of_risk":0
 * }
 */
router.get("/risks/:riskId", middlewares.issue.canView, findRiskById);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/thumbnail.png Get risk thumbnail
 * @apiName getThumbnail
 * @apiGroup Risks
 * @apiDescription Retrieve a risk thumbnail image.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {png} image Thumbnail image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/thumbnail.png", middlewares.issue.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model[/revision/:revId]/risks List all risks
 * @apiName listRisks
 * @apiGroup Risks
 * @apiDescription Retrieve all model risks.
 *
 * @apiUse Risks
 *
 * @apiParam {String} [revId] Revision ID
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"name":"Risk 1",
 * 		"associated_activity":"",
 * 		"assigned_roles":[
 * 			"Job1"
 * 		],
 * 		"category":"safety_fall",
 * 		"comments":[],
 * 		"safetibase_id":"",
 * 		"likelihood":0,
 * 		"consequence":0,
 * 		"residual_likelihood":-1,
 * 		"residual_consequence":-1,
 * 		"mitigation_status":"",
 * 		"mitigation_desc":"",
 * 		"residual_risk":"",
 * 		"owner":"alice",
 * 		"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 		"desc":"Risk description that describes the risk",
 * 		"creator_role":"Job4",
 * 		"position":[55000.0,80000.0,-10000.0],
 * 		"norm":[0,0,0],
 * 		"_id":"00000000-0000-0000-0000-000000000002",
 * 		"created":1567156228976,
 * 		"rev_id":"00000000-0000-0000-0000-000000000001",
 * 		"account":"acme",
 * 		"model":"00000000-0000-0000-0000-000000000000",
 * 		"viewpoint":{
 * 			"right":[0.8,-0.3,0.6],
 * 			"up":[0.3,0.9,-0.3],
 * 			"position":[-70000.0,120000.0,150000.0],
 * 			"look_at":[35000.0,40000.0,8000.0],
 * 			"view_dir":[0.5,-0.4,-0.7],
 * 			"near":600.0,
 * 			"far":300000,
 * 			"fov":1.05,
 * 			"aspect_ratio":1.4,
 * 			"clippingPlanes":[],
 * 			"hideIfc":true,
 * 			"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 			"guid":"00000000-0000-0000-0000-000000000004",
 * 			"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png"
 * 		},
 * 		"level_of_risk":0,
 * 		"residual_level_of_risk":-1,
 * 		"overall_level_of_risk":0
 * 	}
 * ]
 */
router.get("/risks", middlewares.issue.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshot.png Get risk screenshot
 * @apiName getScreenshot
 * @apiGroup Risks
 * @apiDescription Retrieve a risk screenshot image.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {png} image Screenshot image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshot.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshotSmall.png Get low-res screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Risks
 * @apiDescription Retrieve a low-resolution risk screenshot image.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {png} image Small screenshot image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshotSmall.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);

router.get("/revision/:rid/risks", middlewares.issue.canView, listRisks);

/**
 * @api {get} /:teamspace/:model[/revision/:revId]/risks.html Render risks as HTML
 * @apiName renderRisksHTML
 * @apiGroup Risks
 * @apiDescription Retrieve HTML page of all risks.
 *
 * @apiUse Risks
 *
 * @apiParam {String} [revId] Revision ID
 * @apiParam (Query) {String} ids Risk IDs to show
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1
 *
 * @apiSuccessExample {html} Success-Response
 * HTTP/1.1 200 OK
 * <html page>
 */
router.get("/risks.html", middlewares.issue.canView, renderRisksHTML);

router.get("/revision/:rid/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {post} /:teamspace/:model[/revision/:revId]/risks Create a risk
 * @apiName storeRisk
 * @apiGroup Risks
 * @apiDescription Create a model risk.
 *
 * @apiUse Risks
 *
 * @apiParam {String} [revId] Revision ID
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 * {
 * 	"name":"Risk 1",
 * 	"associated_activity":"",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"safetibase_id":"",
 * 	"likelihood":0,
 * 	"consequence":0,
 * 	"level_of_risk":0,
 * 	"overall_level_of_risk":0,
 * 	"residual_likelihood":-1,
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"mitigation_status":"",
 * 	"mitigation_desc":"",
 * 	"residual_risk":"",
 * 	"viewpoint":{
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"near":600.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"highlighted_group_id":"",
 * 		"hideIfc":true,
 * 		"screenshot":<base64 image>
 * 	},
 * 	"desc":"Risk description that describes the risk",
 * 	"creator_role":"Job4",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"norm":[0,0,0]
 * }
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 * {
 * 	"name":"Risk 1",
 * 	"associated_activity":"",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"safetibase_id":"",
 * 	"likelihood":0,
 * 	"consequence":0,
 * 	"level_of_risk":0,
 * 	"overall_level_of_risk":0,
 * 	"residual_likelihood":-1,
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"mitigation_status":"",
 * 	"mitigation_desc":"",
 * 	"residual_risk":"",
 * 	"viewpoint":{
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"near":600.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"highlighted_group_id":"",
 * 		"hideIfc":true,
 * 		"screenshot":<base64 image>
 * 	},
 * 	"desc":"Risk description that describes the risk",
 * 	"creator_role":"Job4",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"norm":[0,0,0]
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"name":"Risk 1",
 * 	"associated_activity":"",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"safetibase_id":"",
 * 	"likelihood":0,
 * 	"consequence":0,
 * 	"residual_likelihood":-1,
 * 	"residual_consequence":-1,
 * 	"mitigation_status":"",
 * 	"mitigation_desc":"",
 * 	"residual_risk":"",
 * 	"owner":"alice",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"desc":"Risk description that describes the risk",
 * 	"creator_role":"Job4",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"norm":[0,0,0],
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"created":1567156228976,
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 * 	"account":"acme",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"viewpoint":{
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"near":600.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"hideIfc":true,
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png"
 * 	},
 * 	"level_of_risk":0,
 * 	"residual_level_of_risk":-1,
 * 	"overall_level_of_risk":0
 * }
 */
router.post("/risks", middlewares.issue.canCreate, storeRisk);

/**
 * @api {patch} /:teamspace/:model[/revision/:revId]/risks/:riskId Update risk
 * @apiName updateRisk
 * @apiGroup Risks
 * @apiDescription Update model risk.
 *
 * @apiUse Risks
 *
 * @apiParam {String} [revId] Revision ID
 * @apiParam {String} riskId Risk ID
 *
 * @apiExample {patch} Example usage:
 * PATCH /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 * {
 * 	"residual_likelihood":1
 * }
 *
 * @apiExample {patch} Example usage:
 * PATCH /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 * {
 * 	"residual_likelihood":1
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"name":"Risk 1",
 * 	"associated_activity":"",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"safetibase_id":"",
 * 	"likelihood":0,
 * 	"consequence":0,
 * 	"residual_likelihood":1,
 * 	"residual_consequence":-1,
 * 	"mitigation_status":"",
 * 	"mitigation_desc":"",
 * 	"residual_risk":"",
 * 	"owner":"alice",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"desc":"Risk description that describes the risk",
 * 	"creator_role":"Job4",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"norm":[0,0,0],
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"created":1567156228976,
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 * 	"account":"acme",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"viewpoint":{
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"near":600.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"hideIfc":true,
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png"
 * 	},
 * 	"level_of_risk":0,
 * 	"residual_level_of_risk":-1,
 * 	"overall_level_of_risk":0
 * }
 */
router.patch("/risks/:riskId", middlewares.issue.canComment, updateRisk,  middlewares.chat.onUpdateRisk,responseCodes.onSuccessfulOperation);

router.post("/revision/:rid/risks", middlewares.issue.canCreate, storeRisk);

router.patch("/revision/:rid/risks/:riskId", middlewares.issue.canComment, updateRisk, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/risks/:riskId/comments Add a comment
 * @apiName commentRisk
 * @apiGroup Risks
 * @apiDescription Create a comment in a risk.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiParam (Request body) {String} _id Risk ID
 * @apiParam (Request body) {String} rev_id Revision ID
 * @apiParam (Request body) {String} comment Comment text
 * @apiParam (Request body) {Object} viewpoint Viewpoint object
 * @apiSuccess {String} guid Comment ID
 * @apiSuccess {Number} created Comment creation timestamp
 * @apiSuccess {String} owner Comment owner
 * @apiSuccess {String} comment Comment text
 * @apiSuccess {Object} viewpoint Viewpoint object
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 * 	"comment":"Comment 1",
 * 	"viewpoint":{
 * 		"right":[0.5,-0.1,0.5],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-50000.0,100000.0,150000.0],
 * 		"look_at":[35000.0,50000.0,9000.0],
 * 		"view_dir":[0.5,-0.5,-1.0],
 * 		"near":500.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.5,
 * 		"clippingPlanes":[],
 * 		"highlighted_group_id":"",
 * 		"screenshot":<base64 image>
 * 	}
 * }
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * 	"guid":"00000000-0000-0000-0000-000000000007",
 * 	"created":1567172228143,
 * 	"owner":"alice",
 * 	"comment":"Comment 1",
 * 	"viewpoint":{
 * 		"right":[0.5,-0.1,0.5],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-50000.0,100000.0,150000.0],
 * 		"look_at":[35000.0,50000.0,9000.0],
 * 		"view_dir":[0.5,-0.5,-1.0],
 * 		"near":500.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.5,
 * 		"clippingPlanes":[],
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000005/screenshot.png",
 * 		"guid":"00000000-0000-0000-0000-000000000006",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000005/screenshotSmall.png"
 * 	}
 * }
 **/
router.post("/risks/:riskId/comments", middlewares.issue.canComment, addComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/comments Delete a comment
 * @apiName deleteComment
 * @apiGroup Risks
 * @apiDescription Delete a risk comment.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiParam (Request body) {String} guid Comment ID
 *
 * @apiExample {delete} Example usage:
 * DELETE /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
 * {
 * 	"guid":"00000000-0000-0000-0000-000000000007",
 * }
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * 	"guid":"00000000-0000-0000-0000-000000000007",
 * }
 **/
router.delete("/risks/:riskId/comments", middlewares.issue.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks?ids=:ids Delete risks
 * @apiName deleteRisks
 * @apiGroup Risks
 * @apiDescription Delete model risks.
 *
 * @apiUse Risks
 *
 * @apiParam (Query) {String} ids Comma separated list of IDs of risks to delete
 *
 * @apiExample {delete} Example usage:
 * DELETE /acme/00000000-0000-0000-0000-000000000000/risks?ids=00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {}
 */
router.delete("/risks/", middlewares.issue.canCreate, deleteRisks);

/**
 * @api {post} /:teamspace/:model/risks/:riskId/resources Attach resources to a rosl
 * @apiName attachResourceRisk
 * @apiGroup Risk
 * @apiDescription Attaches file or url resources to a risk.
 * If the type of the resource is file it should be send as multipart/form-data.
 * Both types at the same time cant be sent. So in order to attach files and urls it should be done
 * with two different requests.
 *
 * This method triggers a chat event
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} riskId Risk unique ID
 *
 * @apiParam (Request body file resource (multipart/form-data)) {File[]} files The array of files to be attached
 * @apiParam (Request body file resource (multipart/form-data)) {String[]} names The names of the files; it should have the same length as the files field and should include the file extension
 * @apiParam (Request body url resource) {String[]} urls The array of urls to be attached
 * @apiParam (Request body url resource) {String[]} names The names of the urls; it should have the same length as the url field
 *
 * @apiSuccessExample {json} Success example result after two files has been uploaded
 *
 * [
 *    {
 *       "_id":"7617f775-9eb7-4877-8ec3-98ea3457e519",
 *       "size":1422,
 *       "riskIds":[
 *          "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
 *       ],
 *       "name":"todo.txt",
 *       "user":"teamSpace1",
 *       "createdAt":1561973996461
 *    },
 *    {
 *       "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
 *       "size":2509356,
 *       "riskIds":[
 *          "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
 *       ],
 *       "name":"football.gif",
 *       "user":"teamSpace1",
 *       "createdAt":1561973996462
 *    }
 * ]
 */
router.post("/risks/:riskId/resources",middlewares.issue.canComment, attachResourcesToRisk, middlewares.chat.onResourcesCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/issues/:issueId/resources Detach a resource from a risk
 * @apiName detachResourceRisk
 * @apiGroup Risks
 * @apiDescription Detachs a resource from a risk. If the risk is the last entity
 * the resources has been attached to it also deletes the resource from the system. This
 * method triggers a chat event .
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} riskId Issue unique ID
 *
 * @apiParam (Request body) {String} _id The resource id to be detached
 *
 * @apiSuccessExample {json}
 *
 * {
 *    "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
 *    "size":2509356,
 *    "riskIds":[
 *    ],
 *    "name":"football.gif",
 *    "user":"teamSpace1",
 *    "createdAt":1561973996462
 * }
 *
 */
router.delete("/risks/:riskId/resources", middlewares.issue.canComment, detachResourcefromRisk, middlewares.chat.onResourceDeleted, responseCodes.onSuccessfulOperation);

function storeRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model } = req.params;
	const data = req.body;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	data.owner = req.session.user.username;
	data.revId = req.params.rid;

	Risk.create(account, model, data, sessionId).then(risk => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risk);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, riskId } = req.params;
	const updateData = req.body;

	const user = req.session.user.username;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	return Risk.update(user, sessionId, account, model, riskId, updateData).then(({updatedTicket, oldTicket, data}) => {
		req.dataModel = updatedTicket;
		req.oldDataModel = oldTicket;
		req.data = data;
		next();
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteRisks(req, res, next) {
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	if (req.query.ids) {
		const ids = req.query.ids.split(",");

		Risk.deleteRisks(dbCol, sessionId, ids).then(() => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success"});
		}).catch((err) => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
		});
	} else {
		responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function listRisks(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, rid } = req.params;
	const branch = rid ? null : "master";
	const ids = req.query.ids ? req.query.ids.split(",") : null;
	const convertCoords = !!req.query.convertCoords;

	Risk.getList(account, model, branch, rid, ids, convertCoords).then(risks => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risks);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findRiskById(req, res, next) {
	const params = req.params;
	const place = utils.APIInfo(req);
	const {account, model} =  req.params;

	Risk.findByUID(account, model, params.riskId).then(risk => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risk);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function renderRisksHTML(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, rid} = req.params;
	const ids = req.query.ids ? req.query.ids.split(",") : undefined;

	Risk.getRisksReport(account, model, req.session.user.username, rid, ids, res).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getScreenshot(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, riskId, vid} = req.params;

	Risk.getScreenshot(account, model, riskId, vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getScreenshotSmall(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, riskId, vid } = req.params;

	Risk.getSmallScreenshot(account, model, riskId, vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, riskId } = req.params;

	Risk.getThumbnail(account, model, riskId).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function addComment(req, res, next) {
	const user = req.session.user.username;
	const data =  req.body;
	const {account, model, riskId} = req.params;

	Comment.addComment(account, model, "risks", riskId, user, data).then(comment => {
		req.dataModel = comment;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function deleteComment(req, res, next) {
	const user = req.session.user.username;
	const guid = req.body.guid;
	const {account, model, riskId} = req.params;

	Comment.deleteComment(account, model, "risks", riskId, guid, user).then(comment => {
		req.dataModel = comment;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function attachResourcesToRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, riskId} = req.params;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const user = req.session.user.username;
	const upload = multer({
		storage: multer.memoryStorage()
	});

	upload.array("file")(req, res, function (err) {
		const names = Array.isArray(req.body.names) ? req.body.names : [req.body.names];
		const urls = req.body.urls;
		if (err) {
			return responseCodes.respond(place, req, res, next, err.resCode ? err.resCode : err , err.resCode ?  err.resCode : err);
		} else {
			let resourcesProm = null;

			if (req.files) {
				resourcesProm = Risk.attachResourceFiles(account, model, riskId, user, sessionId, names, req.files);
			} else {
				resourcesProm = Risk.attachResourceUrls(account, model, riskId, user, sessionId, names, urls);
			}

			resourcesProm.then(resources => {
				req.dataModel = resources;
				next();
			}).catch(promErr => {
				responseCodes.respond(place, req, res, next, promErr, promErr);
			});
		}
	});
}

function detachResourcefromRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, riskId} = req.params;
	const resourceId = req.body._id;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const user = req.session.user.username;

	Risk.detachResource(account, model, riskId, resourceId, user, sessionId).then(ref => {
		req.dataModel = ref;
		next();
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
