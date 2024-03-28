import {Layout} from 'react-grid-layout';

export enum DASHBOARD_ACTIONS {
  UPDATE_LAYOUT = 'UPDATE_LAYOUT'
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
