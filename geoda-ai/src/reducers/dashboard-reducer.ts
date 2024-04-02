import {
  DASHBOARD_ACTIONS,
  HideGridItemActionPayload,
  UpdateGridItemsActionPayload,
  UpdateLayoutActionPayload,
  AddTextGridItemActionPayload
} from '@/actions/dashboard-actions';
import {EditorState} from 'lexical';
import {Layout} from 'react-grid-layout';

export type DashboardStateProps = {
  mode: 'edit' | 'view';
  gridLayout?: Layout[];
  gridItems?: Array<{id: string; show: boolean}>;
  textItems?: Array<{id: string; content: EditorState}>;
};

const initialState: DashboardStateProps = {
  mode: 'edit'
};

type LayoutPayload =
  | UpdateLayoutActionPayload
  | UpdateGridItemsActionPayload
  | HideGridItemActionPayload
  | AddTextGridItemActionPayload;

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

export const dashboardReducer = (state = initialState, action: DashboardAction) => {
  switch (action.type) {
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
    case DASHBOARD_ACTIONS.ADD_TEXT_GRID_ITEM:
      if (isAddTextGridItemActionPayload(action.payload)) {
        return {
          ...state,
          layout: state.gridLayout
            ? [...state.gridLayout, {i: action.payload.id, x: 0, y: 0, w: 6, h: 2}]
            : [{i: action.payload.id, x: 0, y: 0, w: 6, h: 2}],
          textItems: state.textItems
            ? [...state.textItems, {id: action.payload.id, content: action.payload.content}]
            : [{id: action.payload.id, content: action.payload.content}],
          gridItems: state.gridItems
            ? [
                ...state.gridItems,
                {
                  id: action.payload.id,
                  show: true
                }
              ]
            : [
                {
                  id: action.payload.id,
                  show: true
                }
              ]
        };
      }
      return state;
    case DASHBOARD_ACTIONS.HIDE_GRID_ITEM:
      if (isHideGridItemActionPayload(action.payload)) {
        const gridItemId = action.payload.id;
        const gridItem = state.gridItems || [];
        // add {id, show: false} to gridItems if it doesn't exist, otherwise update show to false
        if (gridItem.find(item => item.id === gridItemId)) {
          return {
            ...state,
            gridItems: gridItem.map(item =>
              item.id === gridItemId ? {...item, show: false} : item
            )
          };
        } else {
          return {
            ...state,
            gridItems: [...gridItem, {id: gridItemId, show: false}]
          };
        }
      }
      return state;
    default:
      return state;
  }
};
