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

import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#0C2F54',
			light: '#3c5876',
			dark: '#08203a',
			contrastText: '#fff'
		},
		secondary: {
			main: '#06563c',
			light: '#377763',
			dark: '#377763',
			contrastText: '#fff'
		}
	},
	overrides: {
		MuiInput: {
			root: {
				fontSize: '14px'
			},
			underline: {
				'&:before': {
					borderBottomColor: 'rgba(0, 0, 0, .12) !important'
				}
			}
		}
	}
});
