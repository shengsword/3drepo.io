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

import { Button } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import { Field, FieldArray, Form, Formik } from 'formik';
import { keyBy, map, omit, pick, uniqBy, values } from 'lodash';
import React from 'react';
import * as yup from 'yup';
import { MODEL_ROLES_LIST, MODEL_ROLES_TYPES } from '../../../constants/model-permissions';
import { schema } from '../../../services/validation';
import { CellSelect } from '../customTable/components/cellSelect/cellSelect.component';
import { JobItem } from '../jobItem/jobItem.component';
import { PermissionsTableContexts } from '../permissionsTable/permissionsTable.component';
import { SubmitButton } from '../submitButton/submitButton.component';
import {
	AddButton,
	Container,
	Content,
	Footer,
	IconButton,
	PermissionsTable,
	ProjectCheckboxContainer,
	ProjectConfig,
	TextField
} from './invitationDialog.styles';

const invitationSchema = yup.object().shape({
	email: schema.email,
	job: yup.string(),
});

interface IProps {
	className?: string;
	email?: string;
	job?: string;
	isAdmin?: boolean;
	jobs: any[];
	permissions?: any[];
	projects: any;
	models: any;
	handleClose: () => void;
	sendInvitation: (email, job, isAdmin, permissions, onFinish) => void;
}

export const InvitationDialog = (props: IProps) => {
	const handleSubmit = (formValues, actions) => {
		const onFinish = () => {
			actions.setSubmitting(false);
			props.handleClose();
		};
		props.sendInvitation(formValues.email, formValues.job, formValues.isAdmin, formValues.permissions, onFinish);
	};

	const getProjects = (currentProject, selectedProjects) => {
		const selectedProjectsIds = map(selectedProjects, 'project');
		const availableProjects = values(omit(props.projects, selectedProjectsIds));

		if (currentProject) {
			availableProjects.push(props.projects[currentProject]);
		}
		return availableProjects.map(({ _id, name }) => {
			return { name, value: _id };
		});
	};

	const getModelsPermissions = (currentProject, currentModelsPermissions) => {
		const project = props.projects[currentProject];
		const modelsPermissionsMap = keyBy(currentModelsPermissions, 'model');
		return values(pick(props.models, project.models)).map(({ name, model, federate }) => ({
			model,
			name,
			isFederation: federate,
			key: MODEL_ROLES_TYPES.UNASSIGNED,
			...(modelsPermissionsMap[model] || {})
		}));
	};

	const handlePermissionsChange = (name, currentPermissions, onChange) => (newPermissions) => {
		const value = uniqBy([...newPermissions, ...currentPermissions], 'model');
		onChange({ target: { value, name }});
	};

	const renderPermissions = (projects = []) => (
		<FieldArray name="permissions" render={({ remove, push }) => (
			<>
				{projects.map(({ project, isAdmin }, index) => (
					<div key={index}>
						<ProjectConfig>
							<IconButton onClick={() => remove(index)}>
								<RemoveIcon />
							</IconButton>
							<Field name={`permissions.${index}.project`} render={({ field }) => (
								<FormControl>
									<InputLabel shrink htmlFor={`project-${index}`}>Project</InputLabel>
									<CellSelect
										{...field}
										items={getProjects(project, projects)}
										placeholder="Select project"
										disabledPlaceholder
										displayEmpty
										inputId={`project-${index}`}
									/>
								</FormControl>
							)} />
							{project && (
								<Field name={`permissions.${index}.isAdmin`} render={({ field }) => (
									<ProjectCheckboxContainer
										control={
											<Checkbox
												checked={field.value}
												{...field}
												color="secondary"
											/>
										}
										label="Project Admin"
									/>
								)} />
							)}
						</ProjectConfig>
						{project && !isAdmin && (
							<Field name={`permissions.${index}.models`} render={({ field }) => (
								<PermissionsTable
									modelsNumber={props.projects[project].models.length + 1}
									context={PermissionsTableContexts.MODELS}
									permissions={getModelsPermissions(project, field.value)}
									roles={MODEL_ROLES_LIST}
									onPermissionsChange={handlePermissionsChange(field.name, field.value, field.onChange)}
								/>
							)} />
						)}
					</div>
				))}
				{values(props.projects).length !== projects.length && (
					<AddButton
						color="secondary"
						onClick={() => push({ project: '', isAdmin: false, models: [] })}>
						<AddIcon color="secondary" />
						Add project/model permissions
					</AddButton>
				)}
			</>
		)} />
	);

	const renderForm = ({ values: formValues }) => (
		<Form>
			<Container className={props.className}>
				<Content>
					<Field name="email" render={({ field }) => (
						<TextField
							label="Email"
							required
							{...field}
						/>
					)} />
					<Field name="job" render={({ field }) => (
						<FormControl>
							<InputLabel shrink htmlFor="job">Job</InputLabel>
							<CellSelect
								{...field}
								items={props.jobs}
								displayEmpty
								placeholder="Unassigned"
								inputId="job"
								itemTemplate={JobItem}
							/>
						</FormControl>
					)} />
					<Field name="isAdmin" render={({ field }) => (
						<FormControlLabel
							control={
								<Checkbox
									checked={field.value}
									{...field}
									color="secondary"
								/>
							}
							label="Teamspace Admin"
						/>
					)} />

					{!formValues.isAdmin && renderPermissions(formValues.permissions)}
				</Content>
				<Footer>
					<Button
						type="button"
						color="primary"
						onClick={props.handleClose}
					>
						Cancel
					</Button>
					<Field render={({ form }) => (
						<SubmitButton
							pending={form.isSubmitting}
							disabled={!form.isValid || form.isValidating || form.isSubmitting}
						>
							Invite
						</SubmitButton>
				)} />
				</Footer>
			</Container>
		</Form>
	);

	return (
		<Formik
			validationSchema={invitationSchema}
			onSubmit={handleSubmit}
			initialValues={{ email: props.email, job: props.job, isAdmin: props.isAdmin, permissions: props.permissions }}
			render={renderForm}
		/>
	);
};
