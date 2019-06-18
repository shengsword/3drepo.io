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
import { get, omit } from 'lodash';
import { ScreenshotDialog } from '../../routes/components/screenshotDialog/screenshotDialog.component';
import {
	ErrorDialog, ConfirmDialog, DisconnectedDialog, RevisionsDialog, SimpleErrorDialog
} from '../../routes/components/dialogContainer/components';

interface IDialogConfig {
	title: string;
	template?: JSX.Element;
	content?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	data?: any;
}

export const { Types: DialogTypes, Creators: DialogActions } = createActions({
	showDialog: ['config'],
	showEndpointErrorDialog: ['method', 'dataType', 'error'],
	showErrorDialog: ['method', 'dataType', 'message', 'status'],
	showSimpleErrorDialog: ['config'],
	showConfirmDialog: ['config'],
	showRevisionsDialog: ['config'],
	hideDialog: [],
	setPendingState: ['isPending'],
	showScreenshotDialog: ['config'],
	setMuteNotifications: ['muteNotifications'],
	showDisconnectedDialog: ['config']
}, { prefix: 'DIALOG/' });

export const INITIAL_STATE = {
	isOpen: false,
	isPending: false,
	config: {},
	data: null,
	muteNotifications: false
};

const showDialog = (state = INITIAL_STATE, action) => {
	const config = omit(action.config, 'data') as IDialogConfig;
	return { ...state, config, data: action.config.data, isOpen: true };
};

const showErrorDialog = (state = INITIAL_STATE, { method, dataType, message, status }) => {
	const config = {
		title: 'Error',
		template: ErrorDialog,
		data: {
			method,
			dataType,
			status,
			message
		}
	};

	return showDialog(state, {config});
};

const showEndpointErrorDialog = (state = INITIAL_STATE, { method, dataType, error }) => {
	const isImplementationError = !error.response;
	if (isImplementationError) {
		console.error(error);
	}

	if (error.handled) {
		return state;
	}

	const status = get(error.response, 'status', 'Implementation error');
	const message = get(error.response, 'data.message', error.message);

	return showErrorDialog(state, { method, dataType, message, status});
};

const showConfirmDialog = (state = INITIAL_STATE, action) => {
	const config = { ...action.config, template: ConfirmDialog } as IDialogConfig;
	return showDialog(state, { config });
};

const showSimpleErrorDialog = (state = INITIAL_STATE, action) => {
	const config = { ...action.config, template: SimpleErrorDialog } as IDialogConfig;
	return showDialog(state, { config });
};

const showRevisionsDialog = (state = INITIAL_STATE, action) => {
	const config = { ...action.config, template: RevisionsDialog } as IDialogConfig;
	return showDialog(state, { config });
};

const showScreenshotDialog = (state = INITIAL_STATE, action) => {
	const config = {
		title: action.config.title || 'Screenshot',
		template: ScreenshotDialog,
		onConfirm: action.config.onSave,
		data: {
			disabled: action.config.disabled,
			sourceImage: action.config.sourceImage || ''
		},
		DialogProps: {
			fullScreen: true
		}
	};

	return showDialog(state, {config});
};

const showDisconnectedDialog = (state = INITIAL_STATE, action) => {
	if (state.muteNotifications) {
		return state;
	}

	const config = {
		title: 'Notification Service Disconnected',
		template: DisconnectedDialog,
		onCancel: action.config.onCancel
	};

	return showDialog(state, { config });
};

const hideDialog = (state = INITIAL_STATE) => {
	return { ...state, isOpen: false, isPending: false };
};

const setPendingState = (state = INITIAL_STATE, {isPending}) => {
	return { ...state, isPending };
};

const setMuteNotifications = (state = INITIAL_STATE, { muteNotifications }) => {
	return { ...state, muteNotifications };
};

export const reducer = createReducer({...INITIAL_STATE}, {
	[DialogTypes.HIDE_DIALOG]: hideDialog,
	[DialogTypes.SHOW_DIALOG]: showDialog,
	[DialogTypes.SHOW_ERROR_DIALOG]: showErrorDialog,
	[DialogTypes.SHOW_ENDPOINT_ERROR_DIALOG]: showEndpointErrorDialog,
	[DialogTypes.SHOW_CONFIRM_DIALOG]: showConfirmDialog,
	[DialogTypes.SHOW_SIMPLE_ERROR_DIALOG]: showSimpleErrorDialog,
	[DialogTypes.SHOW_REVISIONS_DIALOG]: showRevisionsDialog,
	[DialogTypes.SET_PENDING_STATE]: setPendingState,
	[DialogTypes.SET_MUTE_NOTIFICATIONS]: setMuteNotifications,
	[DialogTypes.SHOW_SCREENSHOT_DIALOG]: showScreenshotDialog,
	[DialogTypes.SHOW_DISCONNECTED_DIALOG]: showDisconnectedDialog
});
