/**
 *	Copyright (C) 2019 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
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

import Button from '@material-ui/core/Button';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import { get } from 'lodash';
import React from 'react';

import { SmallIconButton } from '../smallIconButon/smallIconButton.component';
import { Actions, Container, Footer, Invitation, List } from './invitationsDialog.styles';

interface IProps {
	className?: string;
	invitations: any[];
	projects: any[];
	onInvitationOpen: (email, job, isAdmin, permissions) => void;
	removeInvitation: (email) => void;
	handleClose: () => void;
}

export const InvitationsDialog = (props: IProps) => {
	const handleInvitationClick = (invitation) => () => {
		const isAdmin = get(invitation, 'permissions.teamspace_admin', false);
		const projects = !invitation.permissions || isAdmin
			? []
			: invitation.permissions.projects.map(({ project, models, project_admin }) => ({
					project: props.projects.find(({ name }) => name === project)._id,
					models,
					isAdmin: project_admin
				}));

		props.onInvitationOpen(
			invitation.email,
			invitation.job,
			isAdmin,
			projects
		);
	};

	const handleInvitationRemove = ({ email }) => () => props.removeInvitation(email);

	const renderInvitationsList = () => (
		<List>
			{props.invitations.map((invitation) => (
				<Invitation key={invitation.email}>
					{invitation.email}
					<Actions>
						<SmallIconButton
							Icon={Edit}
							onClick={handleInvitationClick(invitation)}
						/>
						<SmallIconButton
							Icon={Delete}
							onClick={handleInvitationRemove(invitation)}
						/>
					</Actions>
				</Invitation>
			))}
		</List>
	);

	return (
		<Container className={props.className}>
			{renderInvitationsList()}
			<Footer>
				<Button
					type="button"
					color="primary"
					onClick={props.handleClose}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="raised"
					color="secondary"
					onClick={handleInvitationClick({})}
				>
					Add
				</Button>
			</Footer>
		</Container>
	);
};
