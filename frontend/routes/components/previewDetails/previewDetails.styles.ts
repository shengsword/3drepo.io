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

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';

import { COLOR } from './../../../styles/colors';

export const Container = styled.div`
  color: ${COLOR.BLACK_60};
  background-color: ${COLOR.WHITE};
`;

export const Collapsable = styled(ExpansionPanel)`
  && {
    box-shadow: none;
    padding: 0 8px;
  }
`;

export const Details = styled(ExpansionPanelDetails)`
  && {
    display: flex;
    flex-direction: column;
    padding: 0;
  }
`;

export const Summary = styled(ExpansionPanelSummary)`
  && {
    padding: 0;
  }
`;

export const MoreIcon = styled.div`
  position: absolute;
`;

export const CollapsableContent = styled.div`
  margin: 16px 0;
` as any;

export const NotCollapsable = styled.div`
  background-color: ${COLOR.BLACK_6};
  border-top: 2px solid ${COLOR.BLACK_20};
  padding: 8px;
`;
