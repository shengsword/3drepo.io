/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { get } from 'lodash';
import { put, select, takeLatest } from 'redux-saga/effects';
import { CHAT_CHANNELS } from '../../constants/chat';
import { UnityUtil } from '../../globals/unity-util';
import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { ChatActions } from '../chat';
import { DialogActions } from '../dialog';
import { dispatch } from '../store';
import { selectIfcSpacesHidden } from '../tree';
import { ViewerGuiActions } from '../viewerGui';
import { PRESET_VIEW } from './viewpoints.constants';
import { ViewpointsActions, ViewpointsTypes } from './viewpoints.redux';

export const getThumbnailUrl = (thumbnail) => API.getAPIUrl(thumbnail);

export function* fetchViewpoints({ teamspace, modelId }) {
	try {
		yield put(ViewpointsActions.setPendingState(true));
		const { data: viewpoints } = yield API.getModelViewpoints(teamspace, modelId);
		viewpoints.forEach((viewpoint) => {
			if (viewpoint.screenshot && viewpoint.screenshot.thumbnail) {
				viewpoint.screenshot.thumbnailUrl = getThumbnailUrl(viewpoint.screenshot.thumbnail);
			}
		});

		yield put(ViewpointsActions.fetchViewpointsSuccess(viewpoints));
		yield put(ViewpointsActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'model viewpoints', e.response));
	}
}

export function* generateViewpoint(teamspace, modelId, name, withScreenshot = false) {
	try {
		const hideIfc = yield select(selectIfcSpacesHidden);

		const viewpoint = yield Viewer.getCurrentViewpoint({
			teamspace,
			model: modelId
		});

		const generatedObject = {
			name,
			viewpoint:  {
				...viewpoint,
				hideIfc
			}
		} as any;

		if (withScreenshot) {
			let screenshot = yield Viewer.getScreenshot();
			screenshot = screenshot.substring(screenshot.indexOf(',') + 1);
			generatedObject.viewpoint.screenshot = screenshot;
		}

		const objectInfo = yield Viewer.getObjectsStatus();

		if (objectInfo && (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0)) {
			const { highlightedNodes, hiddenNodes } = objectInfo;

			if (highlightedNodes.length > 0) {
				generatedObject.viewpoint.highlighted_group = {
					objects: highlightedNodes,
					color: UnityUtil.defaultHighlightColor.map((c) => c * 255)
				} ;
			}

			if (hiddenNodes.length > 0) {
				generatedObject.viewpoint.hidden_group = {
					objects: hiddenNodes
				};
			}

		}

		return generatedObject;
	} catch (error) {
		yield put(DialogActions.showErrorDialog('generate', 'viewpoint'));
	}
}

export function* createViewpoint({teamspace, modelId, viewpoint}) {
	try {
		const {data: {_id}} = yield API.createModelViewpoint(teamspace, modelId, viewpoint);
		viewpoint._id = _id;

		yield put(ViewpointsActions.createViewpointSuccess(viewpoint));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'viewpoint', error));
	}
}

export function* updateViewpoint({teamspace, modelId, viewpointId, newName}) {
	try {
		yield API.updateModelViewpoint(teamspace, modelId, viewpointId, newName);

		const updatedView = { _id: viewpointId, name: newName };
		yield put(ViewpointsActions.updateViewpointSuccess(updatedView));
		yield put(ViewpointsActions.setComponentState({ editMode: false }));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'viewpoint', error));
	}
}

export function* deleteViewpoint({teamspace, modelId, viewpointId}) {
	try {
		yield API.deleteModelViewpoint(teamspace, modelId, viewpointId);
		yield put(ViewpointsActions.deleteViewpointSuccess(viewpointId));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'viewpoint', error));
	}
}

const onUpdated = (updatedView) => dispatch(ViewpointsActions.updateViewpointSuccess(updatedView));

const onDeleted = (deletedView) => {
	dispatch(ViewpointsActions.showDeleteInfo(deletedView));

	setTimeout(() => {
		dispatch(ViewpointsActions.deleteViewpointSuccess(deletedView));
	}, 5000);
};

const onCreated = (createdView) => {
	if (createdView.screenshot.thumbnail) {
		createdView.screenshot.thumbnailUrl = getThumbnailUrl(createdView.screenshot.thumbnail);
	}
	dispatch(ViewpointsActions.createViewpointSuccess(createdView));
};

export function* subscribeOnViewpointChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.VIEWS, teamspace, modelId, {
		subscribeToUpdated: onUpdated,
		subscribeToCreated: onCreated,
		subscribeToDeleted: onDeleted
	}));
}

export function* unsubscribeOnViewpointChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.VIEWS, teamspace, modelId, {
		unsubscribeToUpdated: onUpdated,
		unsubscribeToCreated: onCreated,
		unsubscribeToDeleted: onDeleted
	}));
}

export function* setCameraOnViewpoint({ teamspace, modelId, view }) {
	if (view) {

		if (view.preset) {
			switch (view.preset) {
				case PRESET_VIEW.TOP:
					yield Viewer.topView();
					break;
				case PRESET_VIEW.BOTTOM:
					yield Viewer.bottomView();
					break;
				case PRESET_VIEW.FRONT:
					yield Viewer.frontView();
					break;
				case PRESET_VIEW.BACK:
					yield Viewer.backView();
					break;
				case PRESET_VIEW.LEFT:
					yield Viewer.leftView();
					break;
				case PRESET_VIEW.RIGHT:
					yield Viewer.rightView();
					break;
			}
		} else {
			if (view.viewpoint && view.viewpoint.up) {
				const viewpoint = { ...view.viewpoint, account: teamspace, model: modelId };
				yield put(ViewerGuiActions.setCamera(viewpoint));
			} else {
				yield Viewer.goToDefaultViewpoint();
			}

			const clippingPlanes = view.clippingPlanes || get(view, 'viewpoint.clippingPlanes');

			if (clippingPlanes) {
				yield Viewer.updateClippingPlanes( clippingPlanes, teamspace, modelId);
			}
		}
	}
}

export function* showViewpoint({ teamspace, modelId, view }) {
	try {
		yield put(ViewpointsActions.setComponentState({ activeViewpoint: view }));
		yield put(ViewpointsActions.setCameraOnViewpoint(teamspace, modelId, view));
	} catch (error) {
		yield put(ViewpointsActions.setComponentState({ activeViewpoint: null }));
		yield put(DialogActions.showErrorDialog('show', 'viewpoint'));
	}
}

export function* prepareNewViewpoint({teamspace, modelId, viewpointName}) {
	try {
		const newViewpoint = yield generateViewpoint(teamspace, modelId, viewpointName, true);
		yield put(ViewpointsActions.setComponentState({ newViewpoint, activeViewpoint: null, editMode: false }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new viewpoint'));
	}
}

export default function* ViewpointsSaga() {
	yield takeLatest(ViewpointsTypes.FETCH_VIEWPOINTS, fetchViewpoints);
	yield takeLatest(ViewpointsTypes.CREATE_VIEWPOINT, createViewpoint);
	yield takeLatest(ViewpointsTypes.UPDATE_VIEWPOINT, updateViewpoint);
	yield takeLatest(ViewpointsTypes.DELETE_VIEWPOINT, deleteViewpoint);
	yield takeLatest(ViewpointsTypes.SHOW_VIEWPOINT, showViewpoint);
	yield takeLatest(ViewpointsTypes.SET_CAMERA_ON_VIEWPOINT, setCameraOnViewpoint);
	yield takeLatest(ViewpointsTypes.SUBSCRIBE_ON_VIEWPOINT_CHANGES, subscribeOnViewpointChanges);
	yield takeLatest(ViewpointsTypes.UNSUBSCRIBE_ON_VIEWPOINT_CHANGES, unsubscribeOnViewpointChanges);
	yield takeLatest(ViewpointsTypes.PREPARE_NEW_VIEWPOINT, prepareNewViewpoint);
}
