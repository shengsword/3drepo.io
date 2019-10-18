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

import React from 'react';

import { RISK_FILTERS, RISK_LEVELS } from '../../../../constants/risks';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { filtersValuesMap, headerMenuItems } from '../../../../helpers/risks';
import RiskDetails from './components/riskDetails/riskDetails.container';
import { RisksContainer } from './risks.styles';

interface IProps {
	selectedRisk: any;
	history: any;
	location: any;
	teamspace: string;
	model: any;
	risks: any[];
	jobs: any[];
	revision?: string;
	isPending?: boolean;
	fetchingDetailsIsPending?: boolean;
	activeRiskId?: string;
	showDetails?: boolean;
	riskDetails?: any;
	searchEnabled: boolean;
	showPins: boolean;
	selectedFilters: any[];
	modelSettings: {
		permissions: any[];
	};
	activeRiskDetails: any;
	sortOrder: string;
	fetchRisks: (teamspace, model, revision) => void;
	setState: (componentState: any) => void;
	setNewRisk: () => void;
	downloadRisks: (teamspace, model) => void;
	printRisks: (teamspace, model) => void;
	setActiveRisk: (risk, revision?) => void;
	showRiskDetails: (revision, riskId) => void;
	goToRisk: (risk) => void;
	closeDetails: () => void;
	toggleShowPins: (showPins: boolean) => void;
	subscribeOnRiskChanges: (teamspace, modelId) => void;
	unsubscribeOnRiskChanges: (teamspace, modelId) => void;
	saveRisk: (teamspace, modelId, risk) => void;
	toggleSortOrder: () => void;
	setFilters: (filters) => void;
}
export class Risks extends React.PureComponent<IProps, any> {
	get filters() {
		const filterValuesMap = filtersValuesMap(this.props.jobs);
		return RISK_FILTERS.map((riskFilter) => {
			riskFilter.values = filterValuesMap[riskFilter.relatedField];
			return riskFilter;
		});
	}

	get headerMenuItems() {
		const { printRisks, downloadRisks, toggleShowPins, teamspace, model, showPins } = this.props;
		return headerMenuItems(teamspace, model, printRisks, downloadRisks, toggleShowPins, showPins);
	}

	get showDefaultHiddenItems() {
		if (this.props.selectedFilters.length) {
			return this.props.selectedFilters
				.some(({ value: { value } }) => value === RISK_LEVELS.AGREED_FULLY);
		}
		return false;
	}

	public renderDetailsView = renderWhenTrue(() => (
		<RiskDetails
			teamspace={this.props.teamspace}
			model={this.props.model}
			saveRisk={this.props.saveRisk}
		/>
	));

	public componentDidMount() {
		this.props.subscribeOnRiskChanges(this.props.teamspace, this.props.model);
		this.handleSelectedIssue();
	}

	public componentDidUpdate(prevProps) {
		const {selectedRisk} = this.props;

		if (prevProps.selectedRisk !== selectedRisk) {
			this.handleSelectedIssue();
		}
	}

	public componentWillUnmount() {
		this.props.unsubscribeOnRiskChanges(this.props.teamspace, this.props.model);
	}

	public setActiveRisk = (item) => {
		this.props.setActiveRisk(item, this.props.revision);
	}

	public handleToggleFilters = (searchEnabled) => {
		const changes: any = { searchEnabled };

		if (!searchEnabled) {
			changes.selectedFilters = [];
		}
		this.props.setState(changes);
	}

	public closeDetails = () => {
		this.props.goToRisk(null);
	}

	public handleSelectedIssue() {
		const { selectedRisk, revision } = this.props;
		if (selectedRisk) {
			this.props.showRiskDetails(revision, selectedRisk._id);
		} else {
			this.props.closeDetails();
		}
	}

	public render() {
		return (
			<RisksContainer
				type="risk"
				isPending={this.props.isPending}

				items={this.props.risks}
				showDefaultHiddenItems={this.showDefaultHiddenItems}
				activeItemId={this.props.activeRiskId}
				showDetails={this.props.showDetails}
				permissions={this.props.modelSettings.permissions}
				headerMenuItems={this.headerMenuItems}
				searchEnabled={this.props.searchEnabled}
				filters={this.filters}
				selectedFilters={this.props.selectedFilters}
				sortOrder={this.props.sortOrder}

				onToggleFilters={this.handleToggleFilters}
				onChangeFilters={this.props.setFilters}
				onActiveItem={this.setActiveRisk}
				onNewItem={this.props.setNewRisk}
				onShowDetails={this.props.goToRisk}
				onCloseDetails={this.closeDetails}

				renderDetailsView={this.renderDetailsView}
			/>
		);
	}
}
