export 	const getTeamspaceProjects = (teamspaces, teamspaceName) => {
	if (!teamspaceName || !teamspaces.length) {
		return [];
	}

	const selectedTeamspace = teamspaces.find((ts) => ts.account === teamspaceName);
	const projectPlaceholder = { name: 'Select project', disabled: true };
	const teamspaceProjects = selectedTeamspace && selectedTeamspace.projects.length ? selectedTeamspace.projects : [];
	const projects = [projectPlaceholder, ...teamspaceProjects];

	return projects.map(({ name, disabled }) =>
		({ value: name, displayName: name, disabled }));
};

export const getProjectModels = (teamspaces, currentTeamspace, projectName) => {
	const selectedTeamspace = teamspaces.find((ts) => ts.account === currentTeamspace);
	if (selectedTeamspace) {
		const selectedProject = selectedTeamspace.projects.find((p) => p.name === projectName);
		const modelPlaceholder = { name: 'Select model', disabled: true };
		const projectModels = selectedProject && selectedProject.models.length ?
			selectedProject.models : [];
		const filteredModels = projectModels.filter((m) => m.model);
		const models = [modelPlaceholder, ...filteredModels];

		return models.map(({ model, name, disabled }) =>
			({ value: model || true, displayName: name, disabled }));
	}
	return [];
};