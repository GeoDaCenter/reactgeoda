import {Layer} from '@kepler.gl/layers';
import {Feature} from '@kepler.gl/types';

export enum INTERACTION_ACTIONS {
  BRUSH_LINK_FROM_KEPLER = 'BRUSH_LINK_FROM_KEPLER',
  BRUSH_LINK_FROM_GEODA = 'BRUSH_LINK_FROM_GEODA'
}
export type KeplerBrushLinkPayloadProps = {
  layers: Layer[];
  editFeature: Feature;
};

export const keplerBrushLink = (payload: KeplerBrushLinkPayloadProps) => ({
  type: INTERACTION_ACTIONS.BRUSH_LINK_FROM_KEPLER,
  payload
});

export type GeoDaBrushLinkPayloadProps = {
  sourceId: string;
  dataId: string;
  filteredIndex: number[];
};

export const geodaBrushLink = (payload: GeoDaBrushLinkPayloadProps) => ({
  type: INTERACTION_ACTIONS.BRUSH_LINK_FROM_GEODA,
  payload
});
