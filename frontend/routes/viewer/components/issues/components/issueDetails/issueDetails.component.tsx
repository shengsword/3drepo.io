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

import { Viewer } from '../../../../../../services/viewer/viewer';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { Container } from '../../../risks/components/riskDetails/riskDetails.styles';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { IssueDetailsForm } from './issueDetailsForm.component';
import { PreviewDetails } from '../../../previewDetails/previewDetails.component';
import { prepareIssue, mergeIssueData, canComment } from '../../../../../../helpers/issues';
import { LogList } from '../../../../../components/logList/logList.component';
import NewCommentForm from '../../../newCommentForm/newCommentForm.container';

interface IProps {
	jobs: any[];
	issue: any;
	teamspace: string;
	model: string;
	expandDetails: boolean;
	logs: any[];
	fetchingDetailsIsPending: boolean;
	newComment: any;
	myJob: any;
	currentUser: any;
	settings: any;
	setState: (componentState) => void;
	fetchIssue: (teamspace, model, issueId) => void;
	showNewPin: (issue, pinData) => void;
	saveIssue: (teamspace, modelId, issue) => void;
	updateIssue: (teamspace, modelId, issue) => void;
	postComment: (teamspace, modelId, issueData) => void;
	subscribeOnIssueCommentsChanges: (teamspace, modelId, issueId) => void;
	unsubscribeOnIssueCommentsChanges: (teamspace, modelId, issueId) => void;
	getMyJob: (teamspace) => void;
}

interface IState {
	logsLoaded: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class IssueDetails extends React.PureComponent<IProps, IState> {
	public state = {
		logsLoaded: false
	};

	public commentRef = React.createRef<any>();

	get isNewIssue() {
		return !this.props.issue._id;
	}

	get issueData() {
		return prepareIssue(this.props.issue);
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	public componentDidMount() {
		const { teamspace, model, fetchIssue, issue, getMyJob, subscribeOnIssueCommentsChanges } = this.props;
		fetchIssue(teamspace, model, issue._id);
		getMyJob(teamspace);
		subscribeOnIssueCommentsChanges(teamspace, model, issue._id);
	}

	public componentWillUnmount() {
		const { teamspace, model, issue, unsubscribeOnIssueCommentsChanges } = this.props;
		unsubscribeOnIssueCommentsChanges(teamspace, model, issue._id);
	}

	public componentDidUpdate(prevProps) {
		const { teamspace, model, fetchIssue, issue } = this.props;

		if (issue._id !== prevProps.issue._id) {
			fetchIssue(teamspace, model, issue._id);
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newIssue = { ...this.issueData, name };
		this.props.setState({ newIssue });
	}

	public handleIssueFormSubmit = (values) => {
		const { teamspace, model, updateIssue, setState, jobs } = this.props;
		const updatedIssue = mergeIssueData(this.issueData, values);
		console.log('handle from submit')
		if (this.isNewIssue) {
			console.log('handle from submit IF')

			setState({ newRisk: prepareIssue(updatedIssue, jobs) });
		} else {
			console.log('handle from submit ELSE')

			updateIssue(teamspace, model, updatedIssue);
		}
	}

	public renderDetailsForm = () => {
		return (
			<IssueDetailsForm
				issue={this.issueData}
				jobs={this.jobsList}
				onValueChange={this.handleIssueFormSubmit}
				onSubmit={this.handleIssueFormSubmit}
			/>
		);
	}

	public renderLogList = () => {
		return (
			<LogList items={this.props.logs} isPending={this.props.fetchingDetailsIsPending} />
		);
	}

	public renderPreview = renderWhenTrue(() => {
		return (
			<PreviewDetails
				key={this.issueData._id}
				{...this.issueData}
				defaultExpanded={this.props.expandDetails}
				editable={!this.issueData._id}
				onNameChange={this.handleNameChange}
				onExpandChange={this.handleExpandChange}
				renderCollapsable={this.renderDetailsForm}
				renderNotCollapsable={() => this.renderLogList()}
			/>
		);
	});

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center" padding="0">
			<NewCommentForm
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				innerRef={this.commentRef}
				hideComment={false}
				hideScreenshot={false}
				hidePin={false}
				onTakeScreenshot={this.handleNewScreenshot}
				onChangePin={this.handleChangePin}
				onSave={this.handleSave}
			/>
		</ViewerPanelFooter>
	));

	public setCommentData = (commentData = {}) => {
		this.props.setState({ newComment: {
			...this.props.newComment, ...commentData
		}});
	}

	public handleNewScreenshot = async (screenshot) => {
		const { teamspace, model } = this.props;
		const viewpoint = await Viewer.getCurrentViewpoint({ teamspace, model });

		if (this.isNewIssue) {
			this.props.setState({ newRisk: {
				...this.issueData,
				descriptionThumbnail: screenshot
			}});
		} else {
			this.setCommentData({ screenshot, viewpoint });
		}
	}

	public handleChangePin = (pinData) => {
		this.props.showNewPin(this.props.issue, pinData);
	}

	public userCanComment = () => {
		const { myJob, settings, currentUser } = this.props;
		return canComment(this.issueData, myJob, settings.permissions, currentUser.username);
	}

	public postComment = async (teamspace, model, comment) => {
		console.log('post comment');
		const viewpoint = await Viewer.getCurrentViewpoint({ teamspace, model });
		console.log('post props', this.props.issue);
		console.log('post data', this.issueData);
		const issueCommentData = {
			_id: this.issueData._id,
			rev_id: this.issueData.rev_id,
			comment,
			viewpoint
		};

		this.props.postComment(teamspace, model, issueCommentData);
	}

	public handleSave = (comment) => {
		const { teamspace, model, saveIssue } = this.props;
		if (this.isNewIssue) {
			saveIssue(teamspace, model, this.issueData);
		} else {
			this.postComment(teamspace, model, comment);
		}
	}

	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher" padding="0">
					{this.renderPreview(this.props.issue)}
				</ViewerPanelContent>
				{this.renderFooter(this.issueData._id)}
			</Container>
		);
	}
}
