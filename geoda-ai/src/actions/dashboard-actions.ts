import {Layout} from 'react-grid-layout';

export enum DASHBOARD_ACTIONS {
  UPDATE_LAYOUT = 'UPDATE_LAYOUT',
  UPDATE_GRID_ITEMS = 'UPDATE_GRID_ITEMS'
}

export type UpdateLayoutActionPayload = {
  layout?: Layout[];
  gridItems?: Array<{id: string; show: boolean}>;
  textItems?: Array<{id: string; content: string}>;
};

export const updateLayout = (payload: UpdateLayoutActionPayload) => ({
  type: DASHBOARD_ACTIONS.UPDATE_LAYOUT,
  payload
});

export type UpdateGridItemsActionPayload = Array<{id: string; show: boolean}>;
export const updateGridItems = (gridItems: UpdateGridItemsActionPayload) => ({
  type: DASHBOARD_ACTIONS.UPDATE_GRID_ITEMS,
  payload: gridItems
});

// export type hideGridItem = (id: string) => {
//   type: DASHBOARD_ACTIONS.HIDE_GRID_ITEM;
//   payload: {id; show: false};
// };
