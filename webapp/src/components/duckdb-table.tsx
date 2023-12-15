import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Modal from 'react-responsive-modal';

import {
  appInjector,
  Button,
  DataTableModalFactory,
  makeGetActionCreators
} from '@kepler.gl/components';

import {GeoDaState} from '../store';
import {setKeplerTableModal} from '../actions';
import {useDuckDB} from '../hooks/use-duckdb';
import {theme} from '@kepler.gl/styles';

// create a selector to get the action creators from kepler.gl
const keplerActionSelector = makeGetActionCreators();

export function DuckDBTableComponent() {
  const dispatch = useDispatch();

  // get DataTableModal component from appInjector
  const DataTable = appInjector.get(DataTableModalFactory);

  // get GeoDa state from redux store
  const geoda = useSelector((state: GeoDaState) => state.root);

  // get Kepler state from redux store
  const kepler = useSelector((state: GeoDaState) => state.keplerGl['kepler_map']);

  // get action creators from kepler.gl
  const {visStateActions, uiStateActions} = keplerActionSelector(dispatch, {});

  // get duckdb hook
  const {query, importArrowFile} = useDuckDB();

  // write callback function onQueryClick
  const onQueryClick = async () => {
    const result = await query('select * from "data"');
    console.log(result);
  };

  useEffect(() => {
    importArrowFile(geoda.file.rawFileData);
  }, [geoda.file.rawFileData, importArrowFile]);

  return (
    <div style={{height: '100%', width: '80vw', padding: '20px'}} className={'geoda-kepler-map'}>
      <Button onClick={onQueryClick}>Query</Button>
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
        showTab={false}
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

export default DuckDBTableModal;
