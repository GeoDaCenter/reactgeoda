import React, {useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Modal from 'react-responsive-modal';

import {appInjector, DataTableModalFactory, makeGetActionCreators} from '@kepler.gl/components';
import {VisStateActions, UIStateActions} from '@kepler.gl/actions';

import {GeoDaState} from '../store';
import {setKeplerTableModal} from '../actions';
import {THEME} from '@kepler.gl/constants';
import AutoSizer from 'react-virtualized-auto-sizer';

const DataTable = appInjector.get(DataTableModalFactory);
const keplerActionSelector = makeGetActionCreators();

export function DuckDBTableComponent() {
  const dispatch = useDispatch();

  // get Kepler from redux store
  const kepler = useSelector((state: GeoDaState) => state.keplerGl['kepler_map']);
  const {visStateActions, uiStateActions} = keplerActionSelector(dispatch, {});

  // const dataId = Object.keys(kepler.visState.datasets)[0];

  // const datasets = kepler.visState.datasets;

  // const selectedDataset = datasets[dataId];

  // const allColumns = useMemo(
  //   () => selectedDataset?.fields.map((f: {name: string}) => f.name),
  //   [selectedDataset?.fields]
  // );

  // const colMeta = useMemo(
  //   () =>
  //     selectedDataset?.fields.reduce(
  //       (acc, {name, displayName, type, isLoadingStats, filterProps, format, displayFormat}) => ({
  //         ...acc,
  //         [name]: {
  //           name: displayName || name,
  //           type,
  //           ...(isLoadingStats !== undefined ? {isLoadingStats} : {}),
  //           ...(format ? {format} : {}),
  //           ...(displayFormat ? {displayFormat} : {}),
  //           ...(filterProps?.columnStats ? {columnStats: filterProps.columnStats} : {})
  //         }
  //       }),
  //       {}
  //     ),
  //   [selectedDataset?.fields]
  // );

  return (
    <div style={{height: '100%', width: '100vh', padding: '20px'}} className={'geoda-kepler-map'}>
      <DataTable
        datasets={kepler.visState.datasets}
        dataId={Object.keys(kepler.visState.datasets)[0]}
        showDatasetTable={visStateActions.showDatasetTable}
        sortTableColumn={visStateActions.sortTableColumn}
        pinTableColumn={visStateActions.pinTableColumn}
        copyTableColumn={visStateActions.copyTableColumn}
        setColumnDisplayFormat={visStateActions.setColumnDisplayFormat}
        uiStateActions={uiStateActions}
        uiState={kepler.uiState}
        theme={THEME.light}
        showTab={false}
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
