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

import React from 'react';

import { Container, StyledImage } from './image.styles';
import { ScreenshotDialog } from '../screenshotDialog';

interface IProps {
	src: string;
	className: string;
	alt?: string;
	enablePreview?: boolean;
	showScreenshotDialog: (config) => void;
}

export class Image extends React.PureComponent<IProps, any> {
	public handlePreview = () => {
		const { src, enablePreview, showScreenshotDialog } = this.props;
		if (enablePreview && src) {
			showScreenshotDialog({ sourceImage: src, disabled: true, template: ScreenshotDialog });
		}
	}

	public render() {
		const { src, alt, enablePreview, className } = this.props;

		return (
			<Container className={className} enablePreview={enablePreview} onClick={this.handlePreview}>
				<StyledImage src={src} alt={alt} />
			</Container>
		);
	}
}
