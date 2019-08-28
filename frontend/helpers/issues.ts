/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { ISSUE_COLORS, STATUSES, STATUSES_ICONS } from '../constants/issues';
import { getAPIUrl } from '../services/api';
import { hasPermissions, isAdmin, PERMISSIONS } from './permissions';

const renameFieldIfExists = (issue, fieldName, newFieldName) => {
	if (issue[fieldName]) {
		issue[newFieldName] = issue[fieldName];
	}
};

export const prepareIssue = (issue, jobs = []) => {
	const preparedIssue = {...issue};
	if (issue.thumbnail) {
		const thumbnail = getAPIUrl(issue.thumbnail);
		preparedIssue.thumbnail = thumbnail;
	}

	const descriptionThumbnail = issue.viewpoint && issue.viewpoint.screenshot
		? getAPIUrl(issue.viewpoint.screenshot)
		: (issue.descriptionThumbnail || '');

	if (descriptionThumbnail) {
		preparedIssue.descriptionThumbnail = descriptionThumbnail;
	}

	if (issue.priority && issue.status) {
		const { Icon, color } = this.getStatusIcon(issue.priority, issue.status);
		preparedIssue.StatusIconComponent = Icon;
		preparedIssue.statusColor = color;
	}

	if (issue.assigned_roles) {
		const assignedJob = jobs.find((job) => job.name === (issue.assigned_roles || [])[0]);
		const roleColor = (assignedJob || {}).color;
		preparedIssue.roleColor = roleColor;
	}

	if (issue.status) {
		preparedIssue.defaultHidden = issue.status === STATUSES.CLOSED;
	}

	renameFieldIfExists(preparedIssue, 'desc', 'description');
	renameFieldIfExists(preparedIssue, 'owner', 'author');
	renameFieldIfExists(preparedIssue, 'created', 'createdDate');

	return preparedIssue;
};

export const getStatusIcon = (priority, status) => ({
	Icon: STATUSES_ICONS[status] || null,
	color:  (ISSUE_COLORS[status] || ISSUE_COLORS[priority] || ISSUE_COLORS.NONE).color
});

export const getIssuePinColor = (issue: any, selected: boolean = false) => {
	const {status, priority} = issue;
	const colorToUse = ISSUE_COLORS[status] || ISSUE_COLORS[priority] || ISSUE_COLORS.NONE;
	return (selected) ? colorToUse.selectedColor : colorToUse.pinColor;
};

const isOpenIssue = (status) => status !== 'closed';

const userJobMatchesCreator = (userJob, issueData) => {
	return (userJob._id && issueData.creator_role && userJob._id === issueData.creator_role);
};

const isIssueViewer = (permissions) => {
	return permissions && !hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};

const canCommentIssue = (permissions) => {
	return permissions && hasPermissions(PERMISSIONS.COMMENT_ISSUE, permissions);
};

const isJobOwner = (issueData, userJob, permissions, currentUser) => {
	return issueData && userJob &&
		(issueData.owner === currentUser ||
		userJobMatchesCreator(userJob, issueData)) &&
		!isIssueViewer(permissions);
};

const isAssignedJob = (issueData, userJob, permissions) => {
	return issueData && userJob &&
		(userJob._id &&
			issueData.assigned_roles && issueData.assigned_roles.length &&
			userJob._id === issueData.assigned_roles[0]) &&
			!isIssueViewer(permissions);
};

export const canChangeStatusToClosed = (issueData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(issueData, userJob, permissions, currentUser);
};

export const canChangeStatus = (issueData, userJob, permissions, currentUser) => {
	return canChangeStatusToClosed(issueData, userJob, permissions, currentUser) ||
		isAssignedJob(issueData, userJob, permissions);
};

export const canChangeBasicProperty = (issueData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || isJobOwner(issueData, userJob, permissions, currentUser) &&
		canComment(issueData, userJob, permissions, currentUser);
};

export const canChangeAssigned = (issueData, userJob, permissions, currentUser) => {
	return isAdmin(permissions) || canChangeBasicProperty(issueData, userJob, permissions, currentUser);
};

export const canComment = (issueData, userJob, permissions, currentUser) => {
	const isNotClosed = issueData && issueData.status && isOpenIssue(issueData.status);

	const ableToComment =
		isAdmin(permissions) ||
		isJobOwner(issueData, userJob, permissions, currentUser) ||
		canCommentIssue(permissions);

	return ableToComment && isNotClosed;
};
