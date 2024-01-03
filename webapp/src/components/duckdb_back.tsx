import React, {useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Modal from 'react-responsive-modal';

import {
  appInjector,
  DataTableModalFactory,
  DataTableFactory,
  renderedSize
} from '@kepler.gl/components';
import {Field} from '@kepler.gl/types';

import {GeoDaState} from '../store';
import {setKeplerTableModal} from '../actions';
import {theme} from '@kepler.gl/styles';

const DataTable = appInjector.get(DataTableFactory);
const DataTableModal = appInjector.get(DataTableModalFactory);
// const keplerActionSelector = makeGetActionCreators();

export function DuckDBTableComponent() {
  // const dispatch = useDispatch();

  // get Kepler from redux store
  const kepler = useSelector((state: GeoDaState) => state.keplerGl['kepler_map']);
  // const {visStateActions, uiStateActions} = keplerActionSelector(dispatch, {});

  const dataId = Object.keys(kepler.visState.datasets)[0];

  const datasets = kepler.visState.datasets;

  const selectedDataset = datasets[dataId];

  const allColumns = useMemo(
    () => selectedDataset?.fields.map((f: {name: string}) => f.name),
    [selectedDataset?.fields]
  );

  const colMeta = useMemo(
    () =>
      selectedDataset.fields.reduce(
        (acc: {}, field: Field) => ({
          ...acc,
          [field.name]: {
            name: field.displayName || field.name,
            type: field.type,
            ...(field.format ? {format: field.format} : {}),
            ...(field.displayFormat ? {displayFormat: field.displayFormat} : {}),
            ...(field.filterProps?.columnStats ? {columnStats: field.filterProps.columnStats} : {})
          }
        }),
        {}
      ),
    [selectedDataset.fields]
  );

  const cellSizeCache = useMemo(() => {
    if (!colMeta || !selectedDataset) {
      return {};
    }

    return allColumns?.reduce((acc: {}, column: any) => {
      const {colIdx, displayName, type} = colMeta[column];
      return {
        ...acc,
        [column]: renderedSize({
          text: {
            dataContainer: selectedDataset.dataContainer,
            column: displayName
          },
          colIdx,
          type
        })
      };
    }, {});
  }, [colMeta, selectedDataset, allColumns]);

  return (
    <div style={{height: '500px', width: '500px'}}>
      <DataTable
        key={dataId}
        dataId={dataId}
        columns={allColumns}
        colMeta={colMeta}
        cellSizeCache={cellSizeCache}
        dataContainer={selectedDataset.dataContainer}
        pinnedColumns={selectedDataset.pinnedColumns}
        sortOrder={selectedDataset.sortOrder}
        sortColumn={selectedDataset.sortColumn || {}}
        copyTableColumn={DataTableModal.copyTableColumn}
        pinTableColumn={DataTableModal.pinTableColumn}
        sortTableColumn={DataTableModal.sortTableColumn}
        setColumnDisplayFormat={DataTableModal.setColumnDisplayFormat}
        hasStats={false}
        fixedWidth={500}
        fixedHeight={500}
        theme={theme}
      />
    </div>
  );
}

export function DuckDBTableModal() {
  // get dispatch from redux store
  const dispatch = useDispatch();

  // get the state showKeplerTableModal from redux store
  const showKeplerTableModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showKeplerTableModal
  );

  // create a reference to the modal for focus
  const modalRef = useRef(null);

  const onCloseModal = () => {
    dispatch(setKeplerTableModal(false));
  };

  return showKeplerTableModal ? (
    <Modal open={showKeplerTableModal} onClose={onCloseModal} center initialFocusRef={modalRef}>
      <DuckDBTableComponent />
    </Modal>
  ) : null;
}
