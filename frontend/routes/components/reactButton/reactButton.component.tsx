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
import * as PropTypes from 'prop-types';
import { ButtonProps } from '@material-ui/core/Button';

import { ButtonContainer } from './reactButton.styles';

interface IProps extends ButtonProps {
	textValue: string;
}

export class ReactButton extends React.PureComponent<IProps, any> {
	public static propTypes = {
		textValue: PropTypes.string
	};

	public render() {
		return (
			<ButtonContainer
				color="primary"
				variant="raised"
				onClick={this.props.onClick}>
				{this.props.textValue}
			</ButtonContainer>
		);
	}
}
