import {spatialJoin} from 'geoda-wasm';
import {
  getBinaryGeometriesFromLayer,
  getBinaryGeometryTypeFromLayer
} from '@/components/spatial-operations/spatial-join-utils';
import {getColumnData} from './data-utils';
import {Layer} from '@kepler.gl/layers';
import KeplerTable from '@kepler.gl/table';

export type SpatialAssignProps = {
  leftLayer: Layer;
  rightLayer: Layer;
  leftDataset: KeplerTable;
  rightDataset: KeplerTable;
  rightColumnName: string;
};

export async function spatialAssign({
  leftLayer,
  rightLayer,
  leftDataset,
  rightDataset,
  rightColumnName
}: SpatialAssignProps): Promise<number[]> {
  // layer could be GeojsonLayer or PointLayer
  const left = getBinaryGeometriesFromLayer(leftLayer, leftDataset);
  const leftGeometryType = getBinaryGeometryTypeFromLayer(leftLayer);
  const right = getBinaryGeometriesFromLayer(rightLayer, rightDataset);
  const rightGeometryType = getBinaryGeometryTypeFromLayer(rightLayer);

  if (!right || !left) {
    throw new Error('Invalid dataset for spatial assign.');
  }

  // @ts-ignore fix types
  const joinResult = await spatialJoin({left, leftGeometryType, right, rightGeometryType});
  // get the column values from the second dataset
  const assignedValues = getColumnData(rightColumnName, rightDataset.dataContainer);
  const values = joinResult.map(row => assignedValues[row[0]]);

  return values;
}

export type SpatialCountProps = {
  leftLayer: Layer;
  rightLayer: Layer;
  leftDataset: KeplerTable;
  rightDataset: KeplerTable;
};

export async function spatialCount({
  leftLayer,
  rightLayer,
  leftDataset,
  rightDataset
}: SpatialCountProps): Promise<number[][]> {
  // layer could be GeojsonLayer or PointLayer
  const left = getBinaryGeometriesFromLayer(leftLayer, leftDataset);
  const leftGeometryType = getBinaryGeometryTypeFromLayer(leftLayer);
  const right = getBinaryGeometriesFromLayer(rightLayer, rightDataset);
  const rightGeometryType = getBinaryGeometryTypeFromLayer(rightLayer);

  if (!right || !left) {
    throw new Error('Invalid dataset for spatial count.');
  }

  // @ts-ignore fix types
  const joinResult = await spatialJoin({left, leftGeometryType, right, rightGeometryType});
  // convert joinResult to counts
  // const values = joinResult.map(row => row.length);

  return joinResult;
}
