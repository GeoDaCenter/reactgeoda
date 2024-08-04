import {
  DASHBOARD_ACTIONS,
  HideGridItemActionPayload,
  UpdateGridItemsActionPayload,
  UpdateLayoutActionPayload,
  AddTextGridItemActionPayload,
  UpdateTextGridContentPayload
} from '@/actions/dashboard-actions';
import {GRID_ITEM_TYPES, GridItemProps, GridTextItemProps} from '@/utils/grid-utils';
import {Layout} from 'react-grid-layout';

export type DashboardStateProps = {
  mode: 'edit' | 'display';
  gridLayout?: Layout[];
  gridItems?: GridItemProps[];
  textItems?: GridTextItemProps[];
};

const initialState: DashboardStateProps = {
  mode: 'edit'
};

type LayoutPayload =
  | UpdateLayoutActionPayload
  | UpdateGridItemsActionPayload
  | HideGridItemActionPayload
  | AddTextGridItemActionPayload
  | UpdateTextGridContentPayload;

export type DashboardAction = {
  type: string;
  payload: LayoutPayload;
};

// typeguard function to check if the payload is an UpdateLayoutActionPayload
const isUpdateLayoutActionPayload = (
  payload: LayoutPayload
): payload is UpdateLayoutActionPayload => {
  return 'layout' in payload;
};

// typeguard function to check if payload is an HideGridItemActionPayload
const isHideGridItemActionPayload = (
  payload: LayoutPayload
): payload is HideGridItemActionPayload => {
  return 'id' in payload;
};

const isAddTextGridItemActionPayload = (
  payload: LayoutPayload
): payload is AddTextGridItemActionPayload => {
  return 'content' in payload;
};

const isUpdateTextGridItemContentActionPayload = (
  payload: LayoutPayload
): payload is UpdateTextGridContentPayload => {
  return 'newContent' in payload;
};

export const dashboardReducer = (state = initialState, action: DashboardAction) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.UPDATE_MODE:
      return {
        ...state,
        mode: action.payload
      };
    case DASHBOARD_ACTIONS.UPDATE_LAYOUT:
      if (isUpdateLayoutActionPayload(action.payload)) {
        return {
          ...state,
          ...(action.payload.layout ? {gridLayout: action.payload.layout} : {}),
          ...(action.payload.gridItems ? {gridItems: action.payload.gridItems} : {}),
          ...(action.payload.textItems ? {textItems: action.payload.textItems} : {})
        };
      }
      return state;
    case DASHBOARD_ACTIONS.UPDATE_GRID_ITEMS:
      return {
        ...state,
        gridItems: action.payload
      };
    case DASHBOARD_ACTIONS.UPDATE_TEXT_GRID_ITEM_CONTENT:
      if (isUpdateTextGridItemContentActionPayload(action.payload)) {
        const id = action.payload.id;
        const content = action.payload.newContent;
        return {
          ...state,
          textItems: state.textItems
            ? state.textItems.map(item => (item.id === id ? {...item, content: content} : item))
            : []
        };
      }
      return state;
    case DASHBOARD_ACTIONS.ADD_TEXT_GRID_ITEM:
      if (isAddTextGridItemActionPayload(action.payload)) {
        const id = action.payload.id;
        const content = action.payload.content;
        const x = action.payload.x || 0;
        const y = action.payload.y || Infinity;
        return {
          ...state,
          gridLayout: state.gridLayout
            ? [...state.gridLayout, {i: id, x, y, w: 6, h: 2}]
            : [{i: id, x, y, w: 6, h: 2}],
          textItems: state.textItems ? [...state.textItems, {id, content}] : [{id, content}],
          gridItems: state.gridItems
            ? [...state.gridItems, {id, show: true, type: GRID_ITEM_TYPES.TEXT}]
            : [{id, show: true, type: GRID_ITEM_TYPES.TEXT}]
        };
      }
      return state;
    case DASHBOARD_ACTIONS.HIDE_GRID_ITEM:
      if (isHideGridItemActionPayload(action.payload)) {
        const gridItemId = action.payload.id;
        const gridItems = state.gridItems || [];
        // add {id, show: false} to gridItems if it doesn't exist, otherwise update show to false
        return {
          ...state,
          gridItems: gridItems.map(item =>
            item.id === gridItemId ? {...item, show: false} : item
          ),
          // update gridLayout to remove the gridItem
          gridLayout: state.gridLayout?.filter(l => l.i !== gridItemId)
        };
      }
      return state;
    default:
      return state;
  }
};
