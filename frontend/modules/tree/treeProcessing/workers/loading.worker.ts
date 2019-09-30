import { IS_DEVELOPMENT } from '../../../../constants/environment';
import { BACKEND_VISIBILITY_STATES, SELECTION_STATES, VISIBILITY_STATES } from '../../../../constants/tree';
import { INode } from '../treeProcessing.constants';

const isModelNode = (level, isFederation, hasFederationAsParent?) => {
	return (level === 1 && !isFederation) || (level === 2 && hasFederationAsParent);
};

const getNamespacedId = (node) => {
	const { account, model, project } = node;
	return `${account}@${model || project}`;
};

const getTransformedNodeData = (node) => ({
	_id: node._id,
	name: node.name,
	type: node.type,
	teamspace: node.account,
	meta: node.meta || [],
	model: node.model || node.project,
	shared_id: node.shared_id,
	defaultVisibility: BACKEND_VISIBILITY_STATES[node.toggleState]
});

const getFlattenNested = (tree, level = 1, parentId = null, rootParentId = null) => {
	const rowData: INode = {
		...getTransformedNodeData(tree),
		namespacedId: getNamespacedId(tree),
		isFederation: tree.isFederation,
		isModel: tree.isModel || isModelNode(level, tree.isFederation),
		level,
		parentId,
		rootParentId,
		hasChildren: Boolean(tree.children),
		deepChildrenNumber: 0,
		childrenIds: [],
		subTreeRoots: []
	};

	const dataToFlatten = [] as any;

	if (tree.children) {
		rootParentId = rowData.isModel ? rowData._id : rootParentId;

		for (let index = 0; index < tree.children.length; index++) {
			const subTree = tree.children[index];
			subTree.isModel = isModelNode(level + 1, subTree.isFederation, tree.isFederation);

			const { data: nestedData, deepChildrenNumber } = getFlattenNested(subTree, level + 1, tree._id, rootParentId);
			rowData.deepChildrenNumber += deepChildrenNumber;
			rowData.childrenIds.push(subTree._id);
			dataToFlatten.push(nestedData);

			const someOfNestedIsInvisible = nestedData.some((node: INode) => {
				return node.defaultVisibility !== VISIBILITY_STATES.VISIBLE;
			});

			if (someOfNestedIsInvisible) {
				rowData.defaultVisibility = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			}
		}
	}

	dataToFlatten.unshift(rowData);

	const data = dataToFlatten.flat();
	return { data, deepChildrenNumber: data.length };
};

const getAuxiliaryMaps = (nodesList) => {
	const initialState = {
		nodesIndexesMap: {},
		nodesVisibilityMap: {},
		nodesSelectionMap: {},
		nodesBySharedIdsMap: {},
		nodesDefaultVisibilityMap: {}
	} as any;

	return nodesList.reduce((maps, node: INode, index) => {
		maps.nodesIndexesMap[node._id] = index;
		maps.nodesVisibilityMap[node._id] = node.defaultVisibility || VISIBILITY_STATES.VISIBLE;
		maps.nodesDefaultVisibilityMap[node._id] = node.defaultVisibility;
		maps.nodesSelectionMap[node._id] = SELECTION_STATES.UNSELECTED;
		maps.nodesBySharedIdsMap[node.shared_id] = node._id;

		return maps;
	}, initialState);
};

const getMeshesByNodeId = (modelsWithMeshes) => {
	const meshesByNodeId = {};
	for (let index = 0; index < modelsWithMeshes.length; index++) {
		const modelWithMeshes = modelsWithMeshes[index];
		const { account, model: modelId } = modelWithMeshes;
		delete modelWithMeshes.account;
		delete modelWithMeshes.model;
		meshesByNodeId[`${account}@${modelId}`] = modelWithMeshes;
	}
	return meshesByNodeId;
};

self.addEventListener('message', ({ data }) => {
	const { mainTree, subTrees, subModels, modelsWithMeshes } = data;

	// tslint:disable-next-line
	IS_DEVELOPMENT && console.time('TREE PRE-PROCESSING');
	for (let index = 0; index < mainTree.children.length; index++) {
		const child = mainTree.children[index];
		const [modelTeamspace, model] = child.name.split(':');
		const subModel = subModels.find((m) => m.model === model);

		if (subModel) {
			child.name = [modelTeamspace, subModel.name].join(':');
		}

		if (subModel && child.children && child.children[0]) {
			child.children[0].name = subModel.name;
		}

		if (subTrees.length) {
			const subTree = subTrees.find(({ nodes }) => nodes.project === model);
			child.children[0].children = [subTree.nodes];
		}
	}
	// tslint:disable-next-line
	IS_DEVELOPMENT && console.timeEnd('TREE PRE-PROCESSING');

	// tslint:disable-next-line
	IS_DEVELOPMENT && console.time('TREE PROCESSING');
	const { data: nodesList } = getFlattenNested(mainTree);
	const meshesByNodeId = getMeshesByNodeId(modelsWithMeshes);
	const auxiliaryMaps = getAuxiliaryMaps(nodesList);
	const result = { data: { nodesList, meshesByNodeId, ...auxiliaryMaps } };
	// tslint:disable-next-line
	IS_DEVELOPMENT && console.timeEnd('TREE PROCESSING');

	// @ts-ignore
	self.postMessage(JSON.stringify({ result }));
}, false);
