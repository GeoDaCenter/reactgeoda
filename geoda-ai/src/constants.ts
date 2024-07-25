export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
export const MAP_ID = 'kepler_map';
export const PREVIEW_MAP_ID = 'preview_map';

export const DEFAULT_RANDOM_SEED = 123456789;

export const DEFAULT_PANEL_WIDTH = 380;

export const DEFAULT_CHATPANEL_WIDTH = 480;

export const DEFAULT_TABLE_HEIGHT = 300;

export enum ClassificationTypes {
  QUANTILE = 'quantile',
  NATURAL_BREAK = 'natural-break',
  EQUAL_INTERVAL = 'equal-interval',
  PERCENTILE = 'percentile',
  BOX_MAP_15 = 'box-map-15',
  BOX_MAP_30 = 'box-map-30',
  STD_MAP = 'std-map',
  UNIQUE_VALUES = 'unique-values'
}

// create mapping types enum from mappingTypes values extends ClassificationTypes
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

export const LISA_LEGEND = {
  '#eeeeee': 'Not Significant',
  '#ff0000': 'High-High',
  '#0000ff': 'Low-Low',
  '#f4ada8': 'High-Low',
  '#a7adf9': 'Low-High',
  '#464646': 'Isolated'
  // '#999999': 'Invalid'
};
export const LISA_COLORS = Object.keys(LISA_LEGEND);
export const LISA_LABELS = Object.values(LISA_LEGEND);

// openAI responses
export const CHAT_FIELD_NAME_NOT_FOUND =
  'Error: field name is not found. User may forget to mention a field name.';

export const CHAT_COLUMN_DATA_NOT_FOUND =
  'Error: column data is empty. User may forget to mention a field name, or the field type does not match the required data type.';

export const CHAT_WEIGHTS_NOT_FOUND =
  'Error: spatial weights is not found. User may forget to create a spatial weights. User can create a spatial weights using "create spatial weights" command.';

export const CHAT_NOT_ENOUGH_COLUMNS =
  'Error: there was an incorrect field name or plot requires more field names than were listed. User may need to add one or more field names';

// NextUI theme
// accordion related
export const accordionItemClasses = {
  base: 'py-0 w-full m-0',
  title: 'font-normal text-small',
  indicator: 'text-medium',
  content: 'text-small px-0'
};

// SQL keywords array
export const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'ON',
  'AND',
  'OR',
  'NOT',
  'NULL',
  'DISTINCT',
  'COUNT',
  'SUM',
  'AVG',
  'MAX',
  'MIN',
  'LIKE',
  'IN',
  'BETWEEN',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END'
];
