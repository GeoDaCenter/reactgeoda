import React, {useMemo} from 'react';
import {useIntl} from 'react-intl';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue
} from '@nextui-org/react';
import {WeightsMeta} from 'geoda-wasm';
import {formatNumberOrString} from '@/utils/ui-utils';

export function WeightsMetaTable({weightsMeta}: {weightsMeta: WeightsMeta}): React.ReactElement {
  const intl = useIntl();

  // weightsMeta: mapping its key to descriptive label
  const WeightsMetaLabels = useMemo(
    () => ({
      id: 'weights.meta.id',
      name: 'weights.meta.name',
      type: 'weights.meta.type',
      symmetry: 'weights.meta.symmetry',
      numberOfObservations: 'weights.meta.numberOfObservations',
      k: 'weights.meta.k',
      order: 'weights.meta.order',
      incLowerOrder: 'weights.meta.incLowerOrder',
      threshold: 'weights.meta.threshold',
      distanceMetric: 'weights.meta.distanceMetric',
      minNeighbors: 'weights.meta.minNeighbors',
      maxNeighbors: 'weights.meta.maxNeighbors',
      meanNeighbors: 'weights.meta.meanNeighbors',
      medianNeighbors: 'weights.meta.medianNeighbors',
      pctNoneZero: 'weights.meta.pctNoneZero'
    }),
    []
  );

  const rows = useMemo(() => {
    const rows = Object.keys(WeightsMetaLabels)
      .filter(key => key in weightsMeta)
      .map((key, i) => {
        const value = weightsMeta[key];
        const valueString = formatNumberOrString(value, intl.locale);
        return {
          key: `${i}`,
          property: intl.formatMessage({
            id: WeightsMetaLabels[key as keyof typeof WeightsMetaLabels]
          }),
          value: valueString
        };
      });
    return rows;
  }, [weightsMeta, WeightsMetaLabels, intl]);

  return (
    <Table aria-label="Weights Property Table" color="success" selectionMode="single">
      <TableHeader>
        <TableColumn key="property" className="bg-lime-600 text-white">
          Property
        </TableColumn>
        <TableColumn key="value" className="bg-lime-600 text-white">
          Value
        </TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={intl.formatMessage({
          id: 'table.noRows',
          defaultMessage: 'No rows to display.'
        })}
        items={rows}
      >
        {item => (
          <TableRow key={item.key}>
            {columnKey => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
