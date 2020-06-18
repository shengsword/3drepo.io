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

import InputLabel from '@material-ui/core/InputLabel';
import { Field } from 'formik';

import {
	LEVELS_OF_RISK,
	RisksIcon,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
} from '../../../../../../constants/risks';
import { renderWhenTrueOtherwise } from '../../../../../../helpers/rendering';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { Image } from '../../../../../components/image';
import { TextField } from '../../../../../components/textField/textField.component';
import { ImageButton } from '../../../imageButton/imageButton.component';
import PinButton from '../../../pinButton/pinButton.container';
import { ViewpointButton } from '../../../viewpointButton/viewpointButton.component';
import { AutoSuggestField } from '../autoSuggestField/autosuggestField.component';
import { LevelOfRisk } from '../levelOfRisk/levelOfRisk.component';
import {
	Container,
	Content,
	DescriptionImage,
	FieldsContainer,
	FieldsRow,
	StyledFormControl,
	UpdateButtonsContainer
} from '../riskDetails/riskDetails.styles';
import { RiskSchema } from '../riskDetails/riskDetailsForm.component';

interface IProps {
	risk: any;
	active: boolean;
	isNewRisk: boolean;
	canEditBasicProperty: boolean;
	canChangeAssigned: boolean;
	jobs: any[];
	disableViewer?: boolean;
	values?: any;
	criteria: any;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	onUpdateViewpoint: () => void;
	onTakeScreenshot: () => void;
	onUploadScreenshot: (image) => void;
	showScreenshotDialog: (config: any) => void;
}

const UpdateButtons = ({
	isNewRisk, canEditBasicProperty, disableViewer, onSavePin, onChangePin, onUpdateViewpoint, hasImage, ...props
}) => (
	<FieldsRow container alignItems="center" justify="space-between">
		{renderWhenTrueOtherwise(() => (
			<UpdateButtonsContainer>
				<PinButton
					onChange={onChangePin}
					onSave={onSavePin}
					// @TODO check conditions for new ticket
					disabled={!isNewRisk && !canEditBasicProperty}
					hasPin={disableViewer}
				/>
				<ImageButton
					hasImage={Boolean(hasImage)}
					disableScreenshot={!disableViewer}
					onTakeScreenshot={props.onTakeScreenshot}
					onUploadScreenshot={props.onUploadScreenshot}
					onShowScreenshotDialog={props.onShowScreenshotDialog}
					disabled={!canEditBasicProperty}
				/>
				{!isNewRisk && <ViewpointButton
					onUpdate={onUpdateViewpoint}
					disabled={!canEditBasicProperty}
				/>}
			</UpdateButtonsContainer>
			), () => (
				<div>
					//@TODO Add Board version
					No
				</div>
			)
		)(!disableViewer)}
	</FieldsRow>
);

export const MainRiskFormTab: React.FunctionComponent<IProps> = ({
	active, isNewRisk, risk, disableViewer, jobs, canChangeAssigned, canEditBasicProperty,
	values, criteria, ...props
}) => {
	const getCategories = () => {
		const { category = [] } = criteria;
		return category.map((x) => ({label: x, value: x}));
	};

	return (
		<Content active={active}>
			<Container>
				<Field name="desc" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Description"
						disabled={!canEditBasicProperty}
						mutable={!isNewRisk}
					/>
				)} />
			</Container>

			{risk.descriptionThumbnail && (
				<DescriptionImage>
					<Image
						src={risk.descriptionThumbnail}
						enablePreview
					/>
				</DescriptionImage>
			)}

			<FieldsRow container alignItems="center" justify="space-between">
				<UpdateButtons
					isNewRisk={isNewRisk}
					disableViewer={disableViewer}
					canEditBasicProperty={canEditBasicProperty}
					onChangePin={props.onChangePin}
					onSavePin={props.onSavePin}
					onUpdateViewpoint={props.onUpdateViewpoint}
					onTakeScreenshot={props.onTakeScreenshot}
					onUploadScreenshot={props.onUploadScreenshot}
					onShowScreenshotDialog={props.showScreenshotDialog}
					hasImage={risk.descriptionThumbnail}
				/>
			</FieldsRow>

			<FieldsRow container alignItems="center" justify="space-between">
				<FieldsContainer size={'wide'}>
					<StyledFormControl>
						<InputLabel shrink htmlFor="likelihood">Risk Likelihood</InputLabel>
						<Field name="likelihood" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_LIKELIHOODS}
								inputId="likelihood"
								disabled={!canEditBasicProperty}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink htmlFor="consequence">Risk Consequence</InputLabel>
						<Field name="consequence" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_CONSEQUENCES}
								inputId="consequence"
								disabled={!canEditBasicProperty}
							/>
						)} />
					</StyledFormControl>
				</FieldsContainer>

				<FieldsContainer size={'tight'}>
					<StyledFormControl>
						<LevelOfRisk header="Level of Risk" level={values.level_of_risk} Icon={RisksIcon} />
						<Field name="level_of_risk" render={({ field }) => (
							<CellSelect
								{...field}
								items={LEVELS_OF_RISK}
								inputId="level_of_risk"
								disabled
								readOnly
								hidden
							/>
						)} />
					</StyledFormControl>
				</FieldsContainer>
			</FieldsRow>

			<FieldsRow container alignItems="center" justify="space-between">
				<StyledFormControl>
					<InputLabel shrink htmlFor="assigned_roles">Risk owner</InputLabel>
					<Field name="assigned_roles" render={({ field }) => (
						<CellSelect
							{...field}
							items={jobs}
							inputId="assigned_roles"
							disabled={!(isNewRisk || canChangeAssigned)}
						/>
					)} />
				</StyledFormControl>

				<StyledFormControl>
					<InputLabel shrink htmlFor="category">Category</InputLabel>
					<Field name="category" render={({ field }) => (
						<CellSelect
							{...field}
							items={getCategories()}
							inputId="category"
							disabled={!canEditBasicProperty}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>

			<FieldsRow container alignItems="center" justify="space-between">
				<StyledFormControl>
					<Field name="associated_activity" render={({ field, form }) => (
						<AutoSuggestField
							label="Associated Activity"
							suggestions={criteria.associated_activity}
							form={form}
							field={field}
						/>
					)} />
				</StyledFormControl>
				<StyledFormControl>
					<Field name="element" render={({ field, form }) => (
						<AutoSuggestField
							label="Element type"
							suggestions={criteria.element}
							form={form}
							field={field}
							disabled={!canEditBasicProperty}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>

			<FieldsRow container alignItems="center" justify="space-between">
				<FieldsContainer>
					<Field name="risk_factor" render={({ field, form }) => (
						<AutoSuggestField
							label="Risk factor"
							suggestions={criteria.risk_factor}
							form={form}
							field={field}
							disabled={!canEditBasicProperty}
						/>
					)} />
					<Field name="location_desc" render={({ field, form }) => (
						<AutoSuggestField
							label="Location"
							suggestions={criteria.location_desc}
							form={form}
							field={field}
							disabled={!canEditBasicProperty}
						/>
					)} />
				</FieldsContainer>
				<FieldsContainer>
					<Field name="scope" render={({ field, form }) => (
						<AutoSuggestField
							label="Construction Scope"
							suggestions={criteria.scope}
							form={form}
							field={field}
							disabled={!canEditBasicProperty}
						/>
					)} />
				</FieldsContainer>
				<Field name="safetibase_id" render={({ field }) => (
					<input {...field} type="hidden" name="safetibase_id" disabled />
				)} />
			</FieldsRow>
		</Content>
	);
};
