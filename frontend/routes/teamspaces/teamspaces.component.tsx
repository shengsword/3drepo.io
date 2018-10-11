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

import * as React from 'react';
import { isEqual, isEmpty, groupBy } from 'lodash';

import { Panel } from '../components/panel/panel.component';
import { TreeList } from '../components/treeList/treeList.component';
import { Container } from './teamspaces.styles';
import { ModelItem } from './components/modelItem/modelItem.component';

const PANEL_PROPS = {
	title: 'Teamspaces',
	paperProps: {
		height: '100%'
	}
};

interface IProps {
	currentTeamspace: string;
	teamspaces: any[];
	isPending: boolean;
}

interface IState {
	activeTeamspace: string;
}

export class Teamspaces extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		teamspaces: []
	};

	public state = {
		activeTeamspace: ''
	};

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as IState;

		const currentTeamspaceChanged = this.props.currentTeamspace !== prevProps.currentTeamspace;
		if (currentTeamspaceChanged) {
			changes.activeTeamspace = this.props.currentTeamspace;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public onTeamspaceClick = (teamspace, { active }) => {
		this.setState({ activeTeamspace: teamspace.account });
	}

	public renderModel = (props) => {
		return <ModelItem {...props} />;
	}

	public renderProjectItem = (props) => {
		return (
			<TreeList
				{...props}
				level={3}
				renderItem={this.renderModel}
				active={true}
				disableShadow={true}
			/>
		);
	}

	public renderProject = (props) => {
		const {federations = [], models } = groupBy(props.models, ({federate}) => {
			return federate ? 'federations' : 'models';
		});
		const items = [{
			name: 'Federations',
			items: federations
		}, {
			name: 'Models',
			items: models
		}];

		return (
			<TreeList
				key={props.key}
				name={props.name}
				level={2}
				items={items}
				renderItem={this.renderProjectItem}
			/>
		);
	}

	public renderTeamspaces = (teamspaces) => {
		return teamspaces.map((teamspace, index) => {
			return (
				<TreeList
					key={index}
					name={teamspace.account}
					level={1}
					items={teamspace.projects}
					renderItem={this.renderProject}
					onRootClick={this.onTeamspaceClick.bind(this, teamspace)}
					active={teamspace.account === this.state.activeTeamspace}
				/>
			);
		});
	}

	public render() {
		return (
			<Panel {...PANEL_PROPS}>
				<Container>
					{this.renderTeamspaces(this.props.teamspaces)}
				</Container>
			</Panel>
		);
	}
}
