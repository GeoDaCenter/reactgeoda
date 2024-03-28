import {DASHBOARD_ACTIONS, UpdateLayoutActionPayload} from '@/actions/dashboard-actions';
import {Layout} from 'react-grid-layout';

export type DashboardStateProps = {
  mode: 'edit' | 'view';
  gridLayout?: Layout[];
  gridItems?: Array<{id: string; show: boolean}>;
  textItems?: Array<{id: string; content: string}>;
};

const initialState: DashboardStateProps = {
  mode: 'edit'
};

export type DashboardAction = {
  type: string;
  payload: UpdateLayoutActionPayload;
};

export const dashboardReducer = (state = initialState, action: DashboardAction) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.UPDATE_LAYOUT:
      return {
        ...state,
        gridLayout: action.payload.layout,
        gridItems: action.payload.gridItems,
        textItems: action.payload.textItems
      };
    default:
      return state;
  }
};
