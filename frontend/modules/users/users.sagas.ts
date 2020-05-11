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

import { delay } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import * as API from '../../services/api';
import { UsersActions, UsersTypes } from './users.redux';
import { selectCachedResponses } from './users.selectors';

const CACHE_RESPONSE_TTL = 4000;

export function* fetchUserDetails({ teamspace, username }) {
	try {
		const key = `${teamspace}-${username}`;
		const cachedResponses = yield select(selectCachedResponses);

		let apiResponse = null;

		if (!cachedResponses[key]) {
			apiResponse = yield API.getUserDetails(teamspace, username);
		}

		const response = cachedResponses[key] || apiResponse.data;

		yield put(UsersActions.setUserDetailsResponse(key, response));
	} catch (e) {}
}

export default function* UsersSaga() {
	yield takeEvery(UsersTypes.FETCH_USER_DETAILS, fetchUserDetails);
}
