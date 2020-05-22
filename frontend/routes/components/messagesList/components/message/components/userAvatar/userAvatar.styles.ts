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

import styled from 'styled-components';

import { Avatar as AvatarComponent } from '@material-ui/core';
import { COLOR } from '../../../../../../../styles';

export const Avatar = styled(AvatarComponent)`
	&& {
		height: 30px;
		width: 30px;
		background-color: ${(props) => !props.src ? COLOR.BLACK_20 : `transparent`};
		color: ${COLOR.WHITE};
		font-size: 14px;
		border-style: solid;
		border-color: ${({ color }: { color: string }) => !color ? `transparent` : color};
		border-width: ${({ placeholder }: { placeholder: boolean }) => placeholder ? `0px` : `2px`};
	}
`;

export const AvatarWrapper = styled.div`
	display: flex;
	align-items: center;
`;