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

import {capitalize} from 'lodash';
import React from 'react';
import { SelectContainer, TitleActions, TitleContainer, TypesItem, TypesSelect } from '../board.styles';

const types = ['issues', 'risks'];

export const BoardTitleComponent = ({type, handleTypeChange}) => (
	<TitleContainer>
		<SelectContainer>
			<TypesSelect value={type} onChange={handleTypeChange}>
				{types.map((t) => (<TypesItem key={t} value={t}>Project {`${capitalize(t)}`}</TypesItem>))}
			</TypesSelect>
		</SelectContainer>
		<TitleActions>
			<div>Search</div>
			<div>Menu</div>
		</TitleActions>
	</TitleContainer>
);