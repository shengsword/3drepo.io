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

import React from 'react';

import { DATE_TIME_FORMAT } from '../../../../../../../services/formatting/formatDate';
import { COMMENT_FIELD_NAME } from '../../../../../../viewerGui/components/newCommentForm/newCommentForm.constants';
import { DateTime } from '../../../../../dateTime/dateTime.component';
import { Container, Date, IconButton, StyledQuoteIcon, StyledReplyIcon, Username } from './footer.styles';

interface IProps {
	name: string;
	created: any;
	comment: string;
	formRef?: any;
}

export const Footer = ({ name, created, formRef, comment, ...props }: IProps) => {

	const handleReplayButtonClick = () => {
		const commentForm = formRef.current;
		const currentFormCommentValue = commentForm.state.values[COMMENT_FIELD_NAME];

		commentForm.setFieldValue(COMMENT_FIELD_NAME, `${currentFormCommentValue}@${name}`);
	};

	const handleQuoteButtonClick = () => {
		const commentForm = formRef.current;
		const currentFormCommentValue = commentForm.state.values[COMMENT_FIELD_NAME];
		const quoteComment = comment.replace(/(?:\r\n|\r|\n)/g, `\n`);
		const additionalNewLine = (!currentFormCommentValue || currentFormCommentValue.endsWith(`\n`)) ? '' : `  \n`;

		commentForm.setFieldValue(COMMENT_FIELD_NAME, `${currentFormCommentValue}${additionalNewLine}> ${quoteComment}\n\n`);
	};

	return (
		<Container>
			<Username>{name}</Username>
			<Date>
				<DateTime value={created} format={DATE_TIME_FORMAT} />
			</Date>
			<IconButton onClick={handleQuoteButtonClick}>
				<StyledQuoteIcon />
			</IconButton>
			<IconButton onClick={handleReplayButtonClick}>
				<StyledReplyIcon />
			</IconButton>
		</Container>
	);
};
