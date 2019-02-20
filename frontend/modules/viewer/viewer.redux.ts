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

export const { Types: ViewerTypes, Creators: ViewerActions } = createActions({
	waitForViewer: [],
	mapInitialise: ['surveyPoints', 'sources'],
	resetMapSources: ['source'],
	addMapSource: ['source'],
	removeMapSource: ['source'],
	mapStart: [],
	mapStop: [],
	getScreenshot: [],
	updateSettings: ['settings'],
	saveSettings: ['settings'],
	loadSettings: []
}, { prefix: 'VIEWER_' });

const DEFAULT_SETTINGS = {
	shading: 'standard',
	shadows: 'none',
	xray: true,
	statistics: false,
	memory: 2032,
	nearPlane: 1,
	farPlaneSamplingPoints: 5,
	farPlaneAlgorithm: 'box'
};

export const INITIAL_STATE = {
	settings: window.localStorage.getItem('visualSettings') ?
			JSON.parse(window.localStorage.getItem('visualSettings')) : DEFAULT_SETTINGS
};

const updateSettings = (state = INITIAL_STATE, {settings}) => {
	window.localStorage.setItem('visualSettings', JSON.stringify(settings));
	return {...state, settings};
};

export const reducer = createReducer(INITIAL_STATE, {
	[ViewerTypes.UPDATE_SETTINGS] : updateSettings
});
