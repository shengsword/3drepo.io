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

import { put, takeLatest, select, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import * as API from '../../services/api';
import { UsersTypes, UsersActions } from './users.redux';
import { selectCachedResponses } from './users.selectors';

const CACHE_RESPONSE_TTL = 10000;

export function* fetchUserDetails({ teamspace, username }) {
	try {
		const key = `${teamspace}-${username}`;
		const cachedResponses = yield select(selectCachedResponses);

		let apiResponse = null;

		if (!cachedResponses[key]) {
			apiResponse = yield API.getUserDetails(teamspace, username);

			const date = new Date();
			const time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
			apiResponse.data = {
				firstName: `${username}`, lastName: 'Surname', companyName: 'Company X', time
			}; // TODO: Remove them after real backend data
		}

		const response = cachedResponses[key] || apiResponse.data;

		yield put(UsersActions.setUserDetailsResponse(key, response));
		yield	call(delay, CACHE_RESPONSE_TTL);
		yield	put(UsersActions.setUserDetailsResponse(key, null));
	} catch (e) {
	}
}

export default function* UsersSaga() {
	yield takeLatest(UsersTypes.FETCH_USER_DETAILS, fetchUserDetails);
}
