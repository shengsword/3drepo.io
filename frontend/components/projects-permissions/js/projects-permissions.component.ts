/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import {first, get, identity} from "lodash";
import {PROJECT_ROLES_TYPES} from "../../../constants/project-permissions";

class ProjectsPermissionsController implements ng.IController {
	public static $inject: string[] = [
		"ProjectsService",
		"DialogService",
		"$q"
	];

	private projects: object[];
	private currentProject;
	private currentTeamspace;
	private members;
	private permissions;
	private models;
	private projectRequestCanceler;

	constructor(
		private ProjectsService: any,
		private DialogService: any,
		private $q: any
	) {}

	public $onInit(): void {}

	public $onChanges(
		{projects, members, currentTeamspace}: {projects?: any, members?: any, currentTeamspace?: any}
	): void {
		const membersChanged = members && members.currentValue;
		const teamspaceChanged = currentTeamspace && currentTeamspace.currentValue;

		if (teamspaceChanged) {
			this.currentProject = null;
			this.permissions = [];
			this.models = [];

			if (this.projectRequestCanceler) {
				this.projectRequestCanceler.resolve();
			}
		}

		if (membersChanged && this.currentProject) {
			this.onProjectChange();
		}
	}

	public onProjectChange(): void {
		if (this.projectRequestCanceler) {
			this.projectRequestCanceler.resolve();
		}

		this.projectRequestCanceler = this.$q.defer();
		this.ProjectsService.getProject(this.currentTeamspace.account, this.currentProject, {
			timeout: this.projectRequestCanceler.promise
		}).then(({data: project}: {data: {permissions?: object[], models?: object[]}}) => {
			this.permissions = this.getExtendedProjectPermissions(project.permissions);
			this.models = project.models;
		}).catch(identity)
			.finally(() => {
				this.projectRequestCanceler = null;
			});
	}

	/**
	 * Bind permissions with members data
	 * @param projectPermissions
	 */
	public getExtendedProjectPermissions = (projectPermissions) => {
		return projectPermissions
			.map(({user, permissions = [], isSelected = false}: {user: string, permissions: string[], isSelected?: boolean}) => {
				const memberData = this.members.find((member) => member.user === user) || {};
				let projectPermissionsKey = PROJECT_ROLES_TYPES.UNASSIGNED;
				if (memberData.isAdmin) {
					projectPermissionsKey = PROJECT_ROLES_TYPES.ADMINSTRATOR;
				} else {
					projectPermissionsKey = first(permissions) || PROJECT_ROLES_TYPES.UNASSIGNED;
				}

				return {
					...memberData,
					permissions,
					key: projectPermissionsKey,
					isSelected
				};
			});
	}

	/**
	 * Send updated data to the server
	 * @param updatedPermissions
	 */
	public onPermissionsChange(updatedPermissions: any[]): void {
		const permissionsToSave = this.permissions.map(({user, permissions}: {user: string, permissions: string}) => {
			const newPermissions = updatedPermissions.find((permission) => permission.user === user);

			if (newPermissions) {
				return {
					user,
					isSelected: newPermissions.isSelected,
					permissions: newPermissions.key ? [newPermissions.key] : []
				};
			}

			return {user, permissions};
		});

		const updateData = {name: this.currentProject, permissions: permissionsToSave};
		this.ProjectsService.updateProject(this.currentTeamspace.account, updateData)
			.then(({data: updatedProject}) => {
				this.permissions = this.getExtendedProjectPermissions(permissionsToSave);
			}).catch(this.DialogService.showError.bind(null, "update", "project permissions"));
	}

	public goToModelsPermissions(): void {}
}

export const ProjectsPermissionsComponent: ng.IComponentOptions = {
	bindings: {
		currentTeamspace: "<",
		members: "<",
		projects: "<"
	},
	controller: ProjectsPermissionsController,
	controllerAs: "vm",
	templateUrl: "templates/projects-permissions.html"
};

export const ProjectsPermissionsComponentModule = angular
	.module("3drepo")
	.component("projectsPermissions", ProjectsPermissionsComponent);
