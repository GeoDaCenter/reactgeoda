import {BinaryFeatureCollection} from '@loaders.gl/schema';
import {Layer} from '@kepler.gl/layers';
import KeplerTable from '@kepler.gl/table';
import {
  getBinaryGeometriesFromPointLayer,
  getBinaryGeometryTypeFromPointLayer,
  isGeojsonLayer,
  isPointLayer
} from '@/utils/data-utils';

export function getBinaryGeometriesFromLayer(
  layer: Layer,
  dataset: KeplerTable
): BinaryFeatureCollection[] | null {
  if (isPointLayer(layer)) {
    return getBinaryGeometriesFromPointLayer(layer, dataset);
  } else if (isGeojsonLayer(layer)) {
    return layer.dataToFeature as BinaryFeatureCollection[];
  }

  return null;
}

export function getBinaryGeometryTypeFromLayer(layer: Layer) {
  if (isPointLayer(layer)) {
    return getBinaryGeometryTypeFromPointLayer();
  } else if (isGeojsonLayer(layer)) {
    return layer.meta.featureTypes;
  }

  return null;
}
