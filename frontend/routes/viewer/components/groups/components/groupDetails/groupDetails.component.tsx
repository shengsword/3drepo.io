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
import SaveIcon from '@material-ui/icons/Save';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Button from '@material-ui/core/Button';

import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { TooltipButton } from '../../../../../teamspaces/components/tooltipButton/tooltipButton.component';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { Container, ColorPickerWrapper, Actions } from './groupDetails.styles';
import { GroupDetailsForm } from './groupDetailsForm.component';
import { ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { getGroupRGBAColor, hexToArray } from '../../../../../../helpers/colors';
import { ICriteriaFieldState } from '../../../../../../modules/groups/groups.redux';
import { CriteriaField } from '../../../../../components/criteriaField/criteriaField.component';

interface IProps {
	group: any;
	newGroup: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	currentUser: any;
	modelSettings: any;
	GroupTypeIconComponent: any;
	totalMeshes: number;
	canUpdate: boolean;
	selectedNodes: any;
	fieldNames: any[];
	critieriaFieldState: ICriteriaFieldState;
	createGroup: (teamspace, modelId) => void;
	updateGroup: (teamspace, modelId, groupId) => void;
	setState: (componentState) => void;
	setCriteriaState: (criteriaState) => void;
	selectGroup: () => void;
}
interface IState {
	groupColor: any[];
	isFormValid: boolean;
}

export class GroupDetails extends React.PureComponent<IProps, IState> {
	public state = {
		groupColor: undefined,
		isFormValid: false
	};

	public componentDidMount() {
		if (this.props.group.color) {
			this.setState({
				groupColor: this.props.group.color
			});
		}

		if (!this.isNewGroup) {
			this.props.setState({
				newGroup: { ...this.groupData }
			});
		}
	}

	public componentDidUpdate(prevProps) {
		if (prevProps.group.color !== this.props.group.color) {
			this.setState({
				groupColor: this.props.group.color
			});
		}
	}

	get isNewGroup() {
		return !this.props.group._id;
	}

	get groupData() {
		return this.props.group;
	}

	public handleGroupFormSubmit = () => {
		const { teamspace, model, updateGroup, createGroup } = this.props;

		if (this.isNewGroup) {
			createGroup(teamspace, model);
		} else {
			updateGroup(teamspace, model, this.groupData._id);
		}
	}

	public handleNameChange = (event, name) => {
		const newGroup = { ...this.groupData, name };
		this.props.setState({ newGroup });
	}

	public renderGroupForm = () => (
		<GroupDetailsForm
			group={this.groupData}
			onValueChange={this.handleGroupFormSubmit}
			onSubmit={this.handleGroupFormSubmit}
			currentUser={this.props.currentUser}
			groupColor={this.state.groupColor}
			totalMeshes={this.props.totalMeshes}
			permissions={this.props.modelSettings.permissions}
			setState={this.props.setState}
			canUpdate={this.props.canUpdate}
			setIsFormValid={this.setIsFormValid}
			selectedNodes={this.props.selectedNodes}
			fieldNames={this.props.fieldNames}
			critieriaFieldState={this.props.critieriaFieldState}
			setCriteriaState={this.props.setCriteriaState}
		/>
	)

	public handleRulesChange = (event) => {
		this.props.setState({
			newGroup: {
				...this.props.group,
				rules: event.target.value
			}
		});
	}

	public handleCriterionSelect = (criterion) => {
		this.props.setCriteriaState({ criterionForm: criterion });
	}

	public renderRulesField = () => renderWhenTrue(() => (
		<CriteriaField
			value={this.props.group.rules}
			{...this.props.critieriaFieldState}
			onChange={this.handleRulesChange}
			onCriterionSelect={this.handleCriterionSelect}
			setState={this.props.setCriteriaState}
			label="Criteria"
			placeholder="Select first criteria"
			disabled={!this.props.canUpdate}
			fieldNames={this.props.fieldNames}
		/>
	))(true/* this.state.selectedType === GROUPS_TYPES.SMART */)

	public renderPreview = renderWhenTrue(() => (
		<PreviewDetails
			key={this.groupData._id}
			{...this.groupData}
			createdDate={this.props.group.createdAt}
			roleColor={getGroupRGBAColor(this.state.groupColor)}
			editable={!this.groupData._id}
			onNameChange={this.handleNameChange}
			StatusIconComponent={this.props.GroupTypeIconComponent}
			renderCollapsable={this.renderGroupForm}
			renderNotCollapsable={this.renderRulesField}
			disableExpanding
		/>
	));
	public handleColorChange = (color) => {
		const newColor = hexToArray(color);
		this.props.setState({
			newGroup: { ...this.props.newGroup, color: newColor }
		});
		this.setState({ groupColor: newColor });
	}

	public setIsFormValid = (isFormValid) => {
		debugger;
		this.setState({ isFormValid });
	}

	public renderFooter = () => {
		console.log('isFormValid', !this.state.isFormValid);
		return (
			<ViewerPanelFooter alignItems="center">
				<Actions>
					<ColorPickerWrapper>
						<ColorPicker
							disableUnderline={true}
							value={getGroupRGBAColor(this.state.groupColor)}
							onChange={this.handleColorChange}
						/>
					</ColorPickerWrapper>
					<TooltipButton
						label="Reset to saved selection"
						action={this.props.selectGroup}
						Icon={AutorenewIcon}
					/>
				</Actions>
				<Button
					variant="fab"
					color="secondary"
					type="submit"
					onClick={this.handleGroupFormSubmit}
					mini={true}
					aria-label="Save group"
					disabled={!this.state.isFormValid}
				>
					<SaveIcon />
				</Button>
			</ViewerPanelFooter>
		);
	}

	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					{this.renderPreview(this.props.group)}
				</ViewerPanelContent>
				{this.renderFooter()}
			</Container>
		);
	}
}
