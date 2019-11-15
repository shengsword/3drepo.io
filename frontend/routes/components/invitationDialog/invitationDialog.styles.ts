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

import ButtonBase from '@material-ui/core/Button';
import IconButtonBase from '@material-ui/core/IconButton';
import TextFieldBase from '@material-ui/core/TextField';
import styled from 'styled-components';
import { PermissionsTable as PermissionsTableBase } from '../permissionsTable/permissionsTable.component';

export const Container = styled.div`
	min-width: 40vw;
	display: flex;
	flex-direction: column;
`;

export const TextField = styled(TextFieldBase)`
	&& {
		margin-bottom: 10px;
	}
`;

export const Content = styled.div`
	padding: 25px;
	max-height: 40vh;
	overflow: auto;
	display: flex;
	flex-direction: column;
`;

export const Footer = styled.div`
	padding: 12px 25px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

export const AddButton = styled(ButtonBase)`
	&& {
		display: flex;
    flex: none;
    flex-direction: row;
    justify-content: flex-start;
    width: 300px;
    margin-left: -10px;
    padding-left: 8px;
		line-height: 2px;

		svg {
			margin-right: 14px;
		}
	}
`;

export const IconButton = styled(IconButtonBase)`
	&& {
		padding: 5px;
    margin-left: -7px;
    margin-right: 10px;
	}
`;

export const PermissionsTable = styled(PermissionsTableBase)`
	&& {
		height: ${(props: any) => `calc(62px * ${props.modelsNumber})`};
		width: fit-content;
		margin-left: -20px;
		margin-top: 15px;
		margin-bottom: 15px;
	}
`;
