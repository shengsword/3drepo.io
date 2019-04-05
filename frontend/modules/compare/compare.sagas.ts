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

import { put, takeLatest, select, all, takeEvery } from 'redux-saga/effects';
import { cond, matches } from 'lodash';

import { CompareTypes, CompareActions } from './compare.redux';
import { selectRevisions, selectIsFederation, selectSettings, ModelTypes } from '../model';
import { selectSortType, selectSortOrder, selectIsCompareActive } from './compare.selectors';
import { COMPARE_SORT_TYPES, DIFF_COMPARE_TYPE, RENDERING_TYPES } from '../../constants/compare';
import { DialogActions } from '../dialog';
import { Viewer } from '../../services/viewer/viewer';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import { selectCompareModels } from './compare.selectors';
import * as API from '../../services/api';

const getNextRevision = (revisions, currentRevision) => {
	if (!currentRevision) {
		return revisions[0];
	}

	const len = revisions.length;
	const index = revisions.findIndex((r) => r._id === currentRevision);

	const lastRev = index + 1 === len;
	if (lastRev) {
		return revisions[index];
	}

	return revisions[index + 1];
};

const createCompareModel = (id, name, isFederation, revisions) => {
	const [, , currentRevisionTag] = window.location.pathname.replace('/viewer/', '').split('/');

	const baseRevision = isFederation ? revisions[0] :
	revisions.find((rev) => rev.tag === currentRevisionTag || rev._id === currentRevisionTag ) || revisions[0];

	const targetRevision = getNextRevision(revisions, currentRevisionTag);
	const currentRevision =
		currentRevisionTag ? revisions.find((revision) => revision.tag === currentRevisionTag) : revisions[0];

	return {
		_id: id,
		name,
		baseRevision: baseRevision._id,
		currentRevision: currentRevision._id,
		targetDiffRevision: targetRevision._id,
		targetClashRevision: baseRevision._id,
		revisions
	};
};

export function* getCompareModelData({ isFederation, settings }) {
	try {
		const revisions = yield select(selectRevisions);

		if (!isFederation) {
			const model = createCompareModel( settings._id, settings.name, isFederation, revisions);
			yield put(CompareActions.setComponentState({ compareModels: [model] }));
		} else {
			yield all(settings.subModels.map((subModel) => put(CompareActions.getModelInfo(subModel))));
		}

	} catch (error) {
		console.error(error);
	}
}

export function* getModelInfo({ model }) {
	try {
		const { data: revisions } = yield API.getModelRevisions(model.database, model.model);
		const modelInfo = yield Viewer.getModelInfo(model);
		const models = yield select(selectCompareModels);
		const newModel = createCompareModel( modelInfo._id, modelInfo.name, modelInfo.federate, revisions);
		yield put(CompareActions.setComponentState({ compareModels: [...models, newModel] }));
	} catch (error) {
		console.error(error);
	}
}

export function* getCompareModels() {
	try {
		const isFederation = yield select(selectIsFederation);
		const settings = yield select(selectSettings);

		yield put(CompareActions.getCompareModelData(isFederation, settings));
	} catch (error) {
		console.error(error);
	}
}

const handleRenderingTypeChange = cond([
	[matches(RENDERING_TYPES.BASE), Viewer.diffToolShowBaseModel],
	[matches(RENDERING_TYPES.COMPARE), Viewer.diffToolDiffView],
	[matches(RENDERING_TYPES.TARGET), Viewer.diffToolShowComparatorModel]
]);

export function* onRenderingTypeChange({ renderingType }) {
	try {
		handleRenderingTypeChange(renderingType);
		yield put(CompareActions.setComponentState({ renderingType }));
	} catch (error) {
		DialogActions.showErrorDialog('change', 'rendering type');
	}
}

export function* setSortType({ sortType }) {
	try {
		const currentSortType = yield select(selectSortType);
		const currentSortOrder = yield select(selectSortOrder);

		const sortSettings = {
			sortType: currentSortType,
			sortOrder: currentSortOrder
		};

		if (currentSortType !== sortType) {
			sortSettings.sortType = sortType;
			sortSettings.sortOrder = SORT_ORDER_TYPES.ASCENDING;
		} else {
			sortSettings.sortOrder = currentSortOrder === SORT_ORDER_TYPES.ASCENDING
				? SORT_ORDER_TYPES.DESCENDING
				: SORT_ORDER_TYPES.ASCENDING;
		}

		yield put(CompareActions.setComponentState(sortSettings));
	} catch (error) {
		DialogActions.showErrorDialog('set', 'sort type');
	}
}

export function* setActiveTab({ activeTab }) {
	try {
		const currentSortType = yield select(selectSortType);
		const componentStateUpdate = { activeTab } as any;

		if (activeTab === DIFF_COMPARE_TYPE) {
			if (currentSortType === COMPARE_SORT_TYPES.TYPE) {
				componentStateUpdate.sortType = COMPARE_SORT_TYPES.NAME;
				componentStateUpdate.sortOrder = SORT_ORDER_TYPES.ASCENDING;
			}

			Viewer.diffToolEnableWithDiffMode();
		} else {

		}

		handleRenderingTypeChange(RENDERING_TYPES.COMPARE);
		yield put(CompareActions.setComponentState(componentStateUpdate));
	} catch (error) {
		DialogActions.showErrorDialog('set', 'sort type');
	}
}

/* 	public disableComparison(); {

	this.state.compareEnabled = false;
	this.state.canChangeCompareState = false;
	this.state.compareState = '';
	this.ViewerService.diffToolDisableAndClear();

}

	public enableComparison(); {

	this.state.canChangeCompareState = false;
	this.changeCompareState('compare');

	if (this.state.isFed) {
		this.startComparisonFed(this.state.mode === 'diff');
	} else {
		this.diffModel();
	}

} */

export function* toggleCompare() {
	try {
		const isActive = yield select(selectIsCompareActive);
		if (isActive) {
			// this.disableComparison();
		} else {
			// this.enableComparison();
		}
		yield put(CompareActions.setIsActive(!isActive));
	} catch (error) {
		DialogActions.showErrorDialog('start', 'comparing');
	}
}

export default function* CompareSaga() {
	yield takeLatest(ModelTypes.FETCH_SETTINGS_SUCCESS, getCompareModels);
	yield takeLatest(CompareTypes.TOGGLE_COMPARE, toggleCompare);
	yield takeLatest(CompareTypes.ON_RENDERING_TYPE_CHANGE, onRenderingTypeChange);
	yield takeLatest(CompareTypes.GET_COMPARE_MODEL_DATA, getCompareModelData);
	yield takeLatest(CompareTypes.SET_SORT_TYPE, setSortType);
	yield takeLatest(CompareTypes.SET_ACTIVE_TAB, setActiveTab);
	yield takeEvery(CompareTypes.GET_MODEL_INFO, getModelInfo);
}
