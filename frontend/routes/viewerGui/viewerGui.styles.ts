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

import styled from 'styled-components';

export const Container = styled.div`
	height: 100%;
	pointer-events: none;
	z-index: 1;
	flex: 1;
  position: relative;
`;

export const LeftPanels = styled.div`
	pointer-events: all;
	background: pink;
	width: 380px;
	height: calc(100% - 95px);
	position: absolute;
	top: 0;
	left: 90px;
	display: flex;
	flex-direction: column;
`;
export const LeftPanelsButtons = styled.div`
	pointer-events: all;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 90px;
	position: relative;
`;
