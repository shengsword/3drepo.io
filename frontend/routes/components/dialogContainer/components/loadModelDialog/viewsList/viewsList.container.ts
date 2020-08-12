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

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { selectSettings } from '../../../../../../modules/model';
import {
	selectIsPending,
	selectSearchEnabled,
	selectSearchQuery,
	selectViewpointsList,
	ViewpointsActions,
} from '../../../../../../modules/viewpoints';
import { ViewsList } from './viewsList.component';

const mapStateToProps = createStructuredSelector({
	isPending: selectIsPending,
	viewpoints: selectViewpointsList,
	searchQuery: selectSearchQuery,
	searchEnabled: selectSearchEnabled,
	modelSettings: selectSettings,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchViewpoints: ViewpointsActions.fetchViewpoints,
	setState: ViewpointsActions.setComponentState,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewsList));
