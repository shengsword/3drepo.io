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

import React, { Fragment } from 'react';

import { size } from 'lodash';

import { diffData, mergeData } from '../../../../../../helpers/forms';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { canComment } from '../../../../../../helpers/risks';
import { Copy } from '../../../../../components/fontAwesomeIcon';
import { ScreenshotDialog } from '../../../../../components/screenshotDialog';
import { CommentForm } from '../../../commentForm';
import { ContainedButton } from '../../../containedButton/containedButton.component';
import { ViewerPanelContent, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { EmptyStateInfo } from '../../../views/views.styles';
import { Container, HorizontalView, MessagesList, MessageContainer, PreviewDetails } from './riskDetails.styles';
import { RiskDetailsForm } from './riskDetailsForm.component';

interface IProps {
	viewer: any;
	jobs: any[];
	risk: any;
	riskWithMarkdownComments: any[];
	teamspace: string;
	model: string;
	revision: string;
	expandDetails: boolean;
	fetchingDetailsIsPending: boolean;
	newComment: any;
	associatedActivities: any[];
	myJob: any;
	currentUser: any;
	modelSettings: any;
	failedToLoad: boolean;
	disableViewer?: boolean;
	horizontal?: boolean;
	setState: (componentState) => void;
	fetchRisk: (teamspace, model, riskId) => void;
	saveRisk: (teamspace, modelId, risk, revision, finishSubmitting, disableViewer) => void;
	updateRisk: (teamspace, modelId, risk) => void;
	postComment: (teamspace, modelId, riskData, finishSubmitting) => void;
	removeComment: (teamspace, modelId, riskData) => void;
	subscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	unsubscribeOnRiskCommentsChanges: (teamspace, modelId, riskId) => void;
	updateNewRisk: (newRisk) => void;
	setCameraOnViewpoint: (teamspace, modelId, view) => void;
	updateSelectedRiskPin: (position) => void;
	onRemoveResource: (resource) => void;
	attachFileResources: (files) => void;
	attachLinkResources: (links) => void;
	showDialog: (config: any) => void;
	fetchMitigationCriteria: (teamspace: string) => void;
	criteria: any;
	showMitigationSuggestions: (conditions: any, setFieldValue) => void;
	showScreenshotDialog: (config: any) => void;
	showConfirmDialog: (config: any) => void;
}

interface IState {
	logsLoaded: boolean;
	scrolled: boolean;
}

const UNASSIGNED_JOB = {
	name: 'Unassigned',
	value: ''
};

export class RiskDetails extends React.PureComponent<IProps, IState> {
	public state = {
		logsLoaded: false,
		scrolled: false
	};

	public formRef = React.createRef<any>();
	public panelRef = React.createRef<any>();
	public containerRef = React.createRef<any>();
	public messageContainerRef = React.createRef<any>();

	get isNewRisk() {
		return !this.props.risk._id;
	}

	get riskData() {
		return this.props.risk;
	}

	get criteria() {
		return this.props.criteria;
	}

	get jobsList() {
		return [...this.props.jobs, UNASSIGNED_JOB];
	}

	get actionButton() {
		return renderWhenTrue(() => <ContainedButton icon={Copy}>Clone</ContainedButton>)(!this.isNewRisk);
	}

	public commentRef = React.createRef<any>();

	public renderMessagesList = renderWhenTrue(() => (
		<MessagesList
			formRef={this.formRef}
			messages={this.props.riskWithMarkdownComments}
			isPending={this.props.fetchingDetailsIsPending}
			removeMessage={this.removeMessage}
			teamspace={this.props.teamspace}
			currentUser={this.props.currentUser.username}
			setCameraOnViewpoint={this.setCameraOnViewpoint}
		/>
	));

	public renderPreview = renderWhenTrue(() => {
		const { expandDetails, horizontal, failedToLoad, disableViewer } = this.props;
		const { comments } = this.riskData;
		const isRiskWithComments = Boolean((comments && comments.length || horizontal) && !this.isNewRisk);
		const PreviewWrapper = horizontal && isRiskWithComments ? HorizontalView : Fragment;
		const renderNotCollapsable = () => {
			return this.renderMessagesList(!horizontal && isRiskWithComments);
		};

		return (
			<PreviewWrapper>
				<PreviewDetails
					{...this.riskData}
					id={this.riskData._id}
					type="risk"
					key={`${this.riskData._id}${size(this.criteria)}`}
					defaultExpanded={horizontal || expandDetails}
					editable={!this.riskData._id}
					onNameChange={this.handleNameChange}
					onExpandChange={this.handleExpandChange}
					renderCollapsable={this.renderDetailsForm}
					renderNotCollapsable={!horizontal && !this.isNewRisk ? renderNotCollapsable : null}
					handleHeaderClick={this.handleHeaderClick}
					scrolled={this.state.scrolled && !horizontal}
					isNew={this.isNewRisk}
					showModelButton={disableViewer && !this.isNewRisk}
					actionButton={this.actionButton}
				/>
				<MessageContainer ref={this.messageContainerRef}>
					{this.renderMessagesList(horizontal && isRiskWithComments)}
					{this.renderFooter(horizontal && !failedToLoad)}
				</MessageContainer>
			</PreviewWrapper>
		);
	});

	public renderFooter = renderWhenTrue(() => (
		<ViewerPanelFooter alignItems="center" padding="0">
			<CommentForm
				disableViewer={this.props.disableViewer}
				comment={this.props.newComment.comment}
				screenshot={this.props.newComment.screenshot}
				viewpoint={this.props.newComment.viewpoint}
				formRef={this.formRef}
				onTakeScreenshot={this.handleNewScreenshot}
				onSave={this.handleSave}
				canComment={this.userCanComment()}
				hideComment={this.isNewRisk}
				hideScreenshot={this.props.disableViewer}
				messagesContainerRef={this.messageContainerRef}
				previewWrapperRef={this.containerRef}
				horizontal={this.props.horizontal}
				disableIssuesSuggestions
			/>
		</ViewerPanelFooter>
	));

	public renderFailedState = renderWhenTrue(() => {
		return (
			<EmptyStateInfo>Risk failed to load</EmptyStateInfo>
		);
	});

	public componentDidMount() {
		const { teamspace, model, fetchRisk, risk, subscribeOnRiskCommentsChanges, fetchMitigationCriteria } = this.props;

		if (risk._id) {
			fetchRisk(teamspace, model, risk._id);
			subscribeOnRiskCommentsChanges(teamspace, model, risk._id);
		} else {
			fetchMitigationCriteria(teamspace);
		}
	}

	public componentWillUnmount() {
		const { teamspace, model, risk, unsubscribeOnRiskCommentsChanges } = this.props;
		unsubscribeOnRiskCommentsChanges(teamspace, model, risk._id);
	}

	public componentDidUpdate(prevProps) {
		const {
			teamspace, model, fetchRisk, risk, unsubscribeOnRiskCommentsChanges, subscribeOnRiskCommentsChanges,
		} = this.props;

		if (risk._id !== prevProps.risk._id) {
			unsubscribeOnRiskCommentsChanges(prevProps.teamspace, prevProps.model, prevProps.risk._id);
			fetchRisk(teamspace, model, risk._id);
			subscribeOnRiskCommentsChanges(teamspace, model, risk._id);
		}
	}

	public handleHeaderClick = () => {
		if (!this.isNewRisk) { // if its a new issue it shouldnt go to the viewpoint
			this.setCameraOnViewpoint({ viewpoint: this.riskData.viewpoint });
		}
	}

	public handleExpandChange = (event, expanded) => {
		this.props.setState({ expandDetails: expanded });
	}

	public handleNameChange = (event, name) => {
		const newRisk = { ...this.riskData, name };
		this.props.setState({ newRisk });
	}

	public handleRiskFormSubmit = (values) => {
		const { teamspace, model, updateRisk, updateNewRisk } = this.props;

		if (this.isNewRisk) {
			updateNewRisk(mergeData(this.riskData, values));
		} else {
			updateRisk(teamspace, model, diffData(values, this.riskData));
		}
	}

	public renderDetailsForm = () => {
		const {
			onRemoveResource, showDialog, currentUser, myJob, attachFileResources, attachLinkResources, updateSelectedRiskPin,
		} = this.props;

		return (
			<RiskDetailsForm
				risk={this.riskData}
				jobs={this.jobsList}
				criteria={this.criteria}
				onValueChange={this.handleRiskFormSubmit}
				onSubmit={this.handleRiskFormSubmit}
				permissions={this.props.modelSettings.permissions}
				currentUser={currentUser}
				myJob={myJob}
				onUploadScreenshot={this.handleUpdateScreenshot}
				onTakeScreenshot={this.handleTakeScreenshot}
				showScreenshotDialog={this.props.showScreenshotDialog}
				onUpdateViewpoint={this.onUpdateRiskViewpoint}
				onChangePin={updateSelectedRiskPin}
				onSavePin={this.onPositionSave}
				hasPin={!this.props.disableViewer && this.riskData.position && this.riskData.position.length}
				disableViewer={this.props.disableViewer}
				onRemoveResource={onRemoveResource}
				attachFileResources={attachFileResources}
				attachLinkResources={attachLinkResources}
				showDialog={showDialog}
				canComment={this.userCanComment}
				showMitigationSuggestions={this.props.showMitigationSuggestions}
				formRef={this.formRef}
			/>
		);
	}

	public removeMessage = (index, guid) => {
		const riskData = {
			_id: this.riskData._id,
			rev_id: this.riskData.rev_id,
			commentIndex: this.riskData.comments.length - 1 - index,
			guid
		};
		this.props.removeComment(this.props.teamspace, this.props.model, riskData);
	}

	public setCameraOnViewpoint = (viewpoint) => {
		this.props.setCameraOnViewpoint(this.props.teamspace, this.props.model, viewpoint);
	}

	public handlePanelScroll = (e) => {
		if (e.target.scrollTop > 0 && !this.state.scrolled) {
			this.setState({ scrolled: true });
		}
		if (e.target.scrollTop === 0 && this.state.scrolled) {
			this.setState({ scrolled: false });
		}
	}

	public userCanComment() {
		const { myJob, modelSettings, currentUser } = this.props;
		return canComment(this.riskData, myJob, modelSettings.permissions, currentUser.username);
	}

	public setCommentData = (commentData = {}) => {
		const newComment = {
			...this.props.newComment, ...commentData
		};

		this.props.setState({ newComment });
	}

	public handleNewScreenshot = async (screenshot) => {
		const { teamspace, model, viewer } = this.props;
		const viewpoint = await viewer.getCurrentViewpoint({ teamspace, model });

		if (this.isNewRisk) {
			this.props.setState({ newRisk: {
				...this.riskData,
				descriptionThumbnail: screenshot
			}});
		} else {
			this.setCommentData({ screenshot, viewpoint });
		}
	}

	public postComment = async (teamspace, model, { comment, screenshot }, finishSubmitting) => {
		const viewpoint = await this.props.viewer.getCurrentViewpoint({ teamspace, model });

		const riskCommentData = {
			_id: this.riskData._id,
			rev_id: this.riskData.rev_id,
			comment,
			viewpoint: {
				...viewpoint,
				screenshot
			}
		};

		this.props.postComment(teamspace, model, riskCommentData, finishSubmitting);
	}

	public handleSave = (formValues, finishSubmitting) => {
		const { teamspace, model, saveRisk, revision, disableViewer } = this.props;
		if (this.isNewRisk) {
			saveRisk(teamspace, model, this.riskData, revision, finishSubmitting, disableViewer);
		} else {
			this.postComment(teamspace, model, formValues, finishSubmitting);
		}
	}

	public onPositionSave = () => {
		const { teamspace, model, risk, updateRisk } = this.props;

		if (risk._id) {
			updateRisk(teamspace, model, { position: risk.position });
		}
	}

	public handleUpdateScreenshot = (screenshot, disableViewpointSuggestion: boolean) => {
		const { teamspace, model, updateRisk } = this.props;

		if (this.isNewRisk) {
			this.props.setState({ newRisk: {
					...this.riskData,
					descriptionThumbnail: screenshot
				}});
		} else {
			if (screenshot) {
				if (!disableViewpointSuggestion) {
					this.handleViewpointUpdateSuggest();
				}
				updateRisk(teamspace, model, { descriptionThumbnail: screenshot });
			}
		}
	}

	public handleTakeScreenshot = (disableViewpointSuggestion: boolean) => {
		const { showScreenshotDialog, viewer } = this.props;

		showScreenshotDialog({
			sourceImage: viewer.getScreenshot(),
			onSave: (screenshot) => this.handleUpdateScreenshot(screenshot, disableViewpointSuggestion),
			template: ScreenshotDialog,
			notFullScreen: true,
		});
	}

	public handleViewpointUpdateSuggest = () => {
		const { showConfirmDialog } = this.props;
		showConfirmDialog({
			title: 'Save Viewpoint?',
			content: `
				Would you like to update the viewpoint to your current position?
			`,
			onConfirm: async () => {
				await this.handleViewpointUpdate();
			}
		});
	}

	public handleViewpointUpdate = async () => {
		const { teamspace, model, risk, updateRisk, viewer, showConfirmDialog } = this.props;

		const currentViewpoint = await viewer.getCurrentViewpoint({ teamspace, model });

		const viewpoint = mergeData(risk.viewpoint, currentViewpoint);

		if (viewpoint.guid) {
			updateRisk(teamspace, model, { viewpoint });
		}

	}

	public onUpdateRiskViewpoint = async () => {
		await this.handleViewpointUpdate();

		this.props.showConfirmDialog({
			title: 'Save Screenshot?',
			content: `
				Would you like to create a new screenshot?
			`,
			onConfirm: () => {
				this.handleTakeScreenshot(true);
			}
		});
	}

	public render() {
		const { failedToLoad, risk, horizontal } = this.props;

		return (
			<Container ref={this.containerRef} fill={Number(this.isNewRisk)}>
				<ViewerPanelContent
					onScroll={this.handlePanelScroll}
					ref={this.panelRef}
				>
					{this.renderFailedState(failedToLoad)}
					{this.renderPreview(!failedToLoad && risk)}
				</ViewerPanelContent>
				{this.renderFooter(!failedToLoad && !horizontal)}
			</Container>
		);
	}
}
