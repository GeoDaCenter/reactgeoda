import {Layer} from '@kepler.gl/layers';
import {Feature} from '@kepler.gl/types';

export enum KEPLER_ACTIONS {
  BRUSH_LINK_FROM_KEPLER = 'BRUSH_LINK_FROM_KEPLER',
  BRUSH_LINK_FROM_GEODA = 'BRUSH_LINK_FROM_GEODA'
}
export type KeplerBrushLinkPayloadProps = {
  layers: Layer[];
  editFeature: Feature;
};

export const keplerBrushLink = (payload: KeplerBrushLinkPayloadProps) => ({
  type: KEPLER_ACTIONS.BRUSH_LINK_FROM_KEPLER,
  payload
});

export type GeoDaBrushLinkPayloadProps = {
  originId: string;
  dataId: string;
  filteredIndex: number[];
};

export const geodaBrushLink = (payload: GeoDaBrushLinkPayloadProps) => ({
  type: KEPLER_ACTIONS.BRUSH_LINK_FROM_GEODA,
  payload
});
