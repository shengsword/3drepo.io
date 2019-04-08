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

import { createActions, createReducer } from 'reduxsauce';

import { ISelectedFilter } from '../../routes/components/filterPanel/filterPanel.component';
import { DIFF_COMPARE_TYPE, RENDERING_TYPES, COMPARE_SORT_TYPES } from '../../constants/compare';
import { SORT_ORDER_TYPES } from '../../constants/sorting';

export const { Types: CompareTypes, Creators: CompareActions } = createActions({
	toggleCompare: [],
	setIsActive: ['isActive'],
	setCompareType: ['compareType'],
	setModelType: ['modelType'],
	setCompareDisabled: ['isCompareDisabled'],
	setModelVisibility: ['isModelVisible'],
	getCompareModels: ['settings', 'revision'],
	setComponentState: ['componentState'],
	onRenderingTypeChange: ['renderingType'],
	getCompareModelData: ['isFederation', 'settings'],
	setSortType: ['sortType'],
	setActiveTab: ['activeTab'],
	setIsPending: ['isPending']
}, { prefix: 'COMPARE/' });

export interface ICompareComponentState {
	sortType: string;
	sortOrder: string;
	activeTab: string;
	selectedFilters: ISelectedFilter[];
	selectedModelsMap: {};
	compareModels: [];
	renderingType: number;
	isPending: boolean;
}

export interface ICompareState {
	baseModels: any[];
	targetModels: any[];
	isComparePending: boolean;
	isCompareActive: boolean;
	isCompareDisabled: boolean;
	isModelVisible: boolean;
	componentState: ICompareComponentState;
}

export const INITIAL_STATE: ICompareState = {
	baseModels: [],
	targetModels: [],
	isComparePending: false,
	isCompareActive: false,
	isCompareDisabled: false,
	isModelVisible: false,
	componentState: {
		sortType: COMPARE_SORT_TYPES.NAME,
		sortOrder: SORT_ORDER_TYPES.ASCENDING,
		activeTab: DIFF_COMPARE_TYPE,
		selectedFilters: [],
		renderingType: RENDERING_TYPES.COMPARE,
		selectedModelsMap: {},
		compareModels: [],
		isPending: true
	}
};

const setCompareType = (state = INITIAL_STATE, {compareType}) => {
	return { ...state, compareType };
};

const setModelType = (state = INITIAL_STATE, {modelType}) => {
	return { ...state, modelType };
};

const setIsActive = (state = INITIAL_STATE, { isActive }) => {
	return { ...state, isCompareActive: isActive };
};

const setIsPending = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isComparePending: isPending };
};

const setCompareDisabled = (state = INITIAL_STATE, {isCompareDisabled}) => {
	return { ...state, isCompareDisabled };
};

const setModelVisibility = (state = INITIAL_STATE, {isModelVisible}) => {
	return { ...state, isModelVisible };
};

export const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const reducer = createReducer(INITIAL_STATE, {
	[CompareTypes.SET_COMPARE_TYPE] : setCompareType,
	[CompareTypes.SET_MODEL_TYPE] : setModelType,
	[CompareTypes.SET_COMPARE_DISABLED] : setCompareDisabled,
	[CompareTypes.SET_MODEL_VISIBILITY] : setModelVisibility,
	[CompareTypes.SET_COMPONENT_STATE]: setComponentState,
	[CompareTypes.SET_IS_ACTIVE]: setIsActive,
	[CompareTypes.SET_IS_PENDING]: setIsPending
});
