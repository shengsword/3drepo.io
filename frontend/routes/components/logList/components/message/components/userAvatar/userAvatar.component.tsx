/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import { isEmpty, memoize } from 'lodash';
import { renderWhenTrueOtherwise } from '../../../../../../../helpers/rendering';
import { getAvatarUrl } from '../../../../../../../services/api';
import { Popover } from '../markdownMessage/issueReference/issueReference.styles';
import { UserPopover } from '../userPopover/userPopover.component';
import { Avatar, AvatarWrapper } from './userAvatar.styles';

const getMemoizedAvatarUrl = memoize(getAvatarUrl);

const getInitials = (name) => name.split(' ').slice(0, 2).map((text) => text[0]).join('').trim().toUpperCase();

const avatarUrl = (name) => getMemoizedAvatarUrl(name);

interface IProps {
	name: string;
	users: any[];
	jobsList: any[];
}

export const UserAvatar = ({ name, users, jobsList }: IProps) => {
	const url = avatarUrl(name);
	// @TODO change to userDetails data
	const currentUser = users.find((user) => user.user === name);
	const currentUserJobColor = currentUser && jobsList.find((job) => job.name === currentUser.job).color;

	return (
		<>
			{renderWhenTrueOtherwise(
				() => <Avatar src={url} jobColor={currentUserJobColor} />,
				() => <Avatar jobColor={currentUserJobColor}>{getInitials(name)}</Avatar>
			)(!isEmpty(url))}
		</>
	);
};
