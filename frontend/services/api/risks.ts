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

import api from './';

/**
 * Get risk
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getRisk = (teamspace, modelId, riskId) => {
	return api.get(`${teamspace}/${modelId}/risks/${riskId}`);
};

/**
 * Save risk
 * @param teamspace
 * @param modelId
 * @param risk
 */
export const saveRisk = (teamspace, modelId, risk) => {
	if (risk.pickedPos !== null) {
		risk.position = risk.pickedPos;
		risk.norm = risk.pickedNorm;
	}

	if (risk.rev_id) {
		return api.post(`${teamspace}/${modelId}/revision/${risk.rev_id}/risks`, risk);
	}
	return api.post(`${teamspace}/${modelId}/risks`, risk);
};

/**
 * Update risk
 * @param teamspace
 * @param modelId
 * @param risk
 */
export const updateRisk = (teamspace, modelId, id, revId, risk) => {
	if (risk.rev_id) {
		return api.patch(`${teamspace}/${modelId}/revision/${revId}/risks/${id}`, risk);
	}
	return api.patch(`${teamspace}/${modelId}/risks/${id}`, risk);
};

/**
 * Get risks list
 * @param teamspace
 * @param modelId
 * @param revision
 */
export const getRisks = (teamspace, modelId, revision?) => {
	if (revision) {
		return api.get(`${teamspace}/${modelId}/revision/${revision}/risks`);
	}
	return api.get(`${teamspace}/${modelId}/risks`);
};

/**
 * Delete risks
 * @param teamspace
 * @param modelId
 * @param risksIds
 */
export const deleteRisks = (teamspace, modelId, risksIds) => {
	return api.delete(`${teamspace}/${modelId}/risks/?ids=${risksIds}`);
};
