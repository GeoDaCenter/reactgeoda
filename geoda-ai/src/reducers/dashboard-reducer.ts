import {
  DASHBOARD_ACTIONS,
  UpdateGridItemsActionPayload,
  UpdateLayoutActionPayload
} from '@/actions/dashboard-actions';
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
  payload: UpdateLayoutActionPayload | UpdateGridItemsActionPayload;
};

// typeguard function to check if the payload is an UpdateLayoutActionPayload
const isUpdateLayoutActionPayload = (
  payload: UpdateLayoutActionPayload | UpdateGridItemsActionPayload
): payload is UpdateLayoutActionPayload => {
  return 'layout' in payload;
};

export const dashboardReducer = (state = initialState, action: DashboardAction) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.UPDATE_LAYOUT:
      if (isUpdateLayoutActionPayload(action.payload)) {
        return {
          ...state,
          gridLayout: action.payload.layout,
          gridItems: action.payload.gridItems,
          textItems: action.payload.textItems
        };
      }
      return state;
    case DASHBOARD_ACTIONS.UPDATE_GRID_ITEMS:
      return {
        ...state,
        gridItems: action.payload
      };
    default:
      return state;
  }
};
