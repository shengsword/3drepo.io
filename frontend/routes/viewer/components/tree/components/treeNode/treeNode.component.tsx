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
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ShowIcon from '@material-ui/icons/Visibility';
import IsolateIcon from '@material-ui/icons/VisibilityOutlined';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';

import { Container, Name, NameWrapper, Actions, StyledExpandableButton } from './treeNode.styles';
import {
	TREE_ITEM_FEDERATION_TYPE,
	TREE_ITEM_MODEL_TYPE,
	TREE_ITEM_OBJECT_TYPE
} from '../../../../../../constants/tree';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
interface IProps {
	data: any;
	settings: any;
	parentId?: number;
	parentIndex?: number;
	visible?: boolean;
	selected?: boolean;
	highlighted?: boolean;
	expanded?: boolean;
	isModel?: boolean;
	isSearchResult?: boolean;
	collapseNode?: (id) => void;
	expandNode?: (id) => void;
	selectNode?: (id) => void;
	deselectNode?: (id) => void;
}

const CollapseButton = ({ Icon, onClick, expanded, hasChildren, nodeType }) => (
	<StyledExpandableButton
		onClick={onClick}
		expanded={expanded}
		hasChildren={hasChildren}
		nodeType={nodeType}>
		<Icon size="small" />
	</StyledExpandableButton>
);

export class TreeNode extends React.PureComponent<IProps, any> {

	get node() {
		return this.props.data;
	}

	get type() {
		if (this.node.isFederation) {
			return TREE_ITEM_FEDERATION_TYPE;
		} else if (this.props.isModel) {
			return TREE_ITEM_MODEL_TYPE;
		}
		return TREE_ITEM_OBJECT_TYPE;
	}

	get level() {
		if (this.props.isSearchResult) {
			return 0;
		}
		return this.node.level;
	}

	get isExpandedModelInFederation() {
		return this.type === TREE_ITEM_MODEL_TYPE && this.level === 2 && this.props.expanded;
	}

	get isHightlightedObject() {
		return this.type === TREE_ITEM_OBJECT_TYPE && this.props.highlighted;
	}
	public static defaultProps = {
		visible: false,
		selected: false,
		highlighted: false,
		expanded: false,
		hasChildren: false,
		childrenNumber: 0,
		isFederation: false,
		isModel: false
	};

	private renderExpandableButton = renderWhenTrue(() => {
		const { expanded } = this.props;
		return (
			<CollapseButton
				nodeType={this.type}
				expanded={expanded}
				hasChildren={this.node.hasChildren}
				Icon={!expanded && this.node.hasChildren ? AddIcon : RemoveIcon}
				onClick={!expanded && this.node.hasChildren ? this.expandNode : this.collapseNode}
			/>
		);
	});

	private renderModelActions = renderWhenTrue(() => (
		<Actions>
			<SmallIconButton
				Icon={OpenInNewIcon}
				tooltip="Open model in new tab"
				onClick={this.handleOpenModelClick}
			/>
		</Actions>
	));

	private renderHighlightedObjectActions = renderWhenTrue(() => (
		<Actions>
			<SmallIconButton
				Icon={UpIcon}
				tooltip="Go to top"
			/>
			<SmallIconButton
				Icon={IsolateIcon}
				tooltip="Isolate"
			/>
			<SmallIconButton
				Icon={ShowIcon}
				tooltip="Show/Hide"
			/>
		</Actions>
	));

	public render() {
		const { highlighted, expanded, selected, isSearchResult } = this.props;

		return (
			<Container
				nodeType={this.type}
				expandable={this.node.hasChildren}
				selected={!isSearchResult && selected}
				highlighted={!isSearchResult && highlighted}
				expanded={isSearchResult && expanded}
				level={this.level}
				onClick={this.handleNodeClick}
			>
				{this.renderName()}
				{this.renderModelActions(this.isExpandedModelInFederation)}
				{this.renderHighlightedObjectActions(this.isHightlightedObject)}
			</Container>
		);
	}

	private expandNode = (event) => {
		event.stopPropagation();
		this.props.expandNode(this.node._id);
	}

	private collapseNode = (event) => {
		event.stopPropagation();

		if (this.node.hasChildren) {
			this.props.collapseNode(this.node._id);
		}
		return;
	}

	private handleOpenModelClick = () => {
		const [teamspace, name] = this.node.name.split(':');
		const {model} = this.props.settings.subModels.find((subModel) => subModel.name === name);

		window.open(`${window.location.origin}/viewer/${teamspace}/${model}`);
	}

	private handleNodeClick = () => {
		this.props.selectNode(this.node._id);
	}

	private renderName = () => (
		<NameWrapper>
			{this.renderExpandableButton(!this.node.isFederation && !this.props.isSearchResult)}
			<Name nodeType={this.type}>{this.node.childrenNumber} {this.node.name}</Name>
		</NameWrapper>
	)
}