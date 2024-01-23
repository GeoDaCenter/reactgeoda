export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
export const MAP_ID = 'kepler_map';

// create mapping types enum from mappingTypes values
export enum MappingTypes {
  QUANTILE = 'quantile',
  NATURAL_BREAK = 'natural-break',
  EQUAL_INTERVAL = 'equal-interval',
  PERCENTILE = 'percentile',
  BOX_MAP_15 = 'box-map-15',
  BOX_MAP_30 = 'box-map-30',
  STD_MAP = 'std-map',
  UNIQUE_VALUES = 'unique-values',
  COLOCATION = 'colocation',
  RAW_RATE = 'raw-rate',
  EXCESS_RATE = 'excess-rate',
  EB_MAP = 'eb-map',
  SPATIAL_RATE = 'spatial-rate',
  SPATIAL_EB_MAP = 'spatial-eb-map'
}
