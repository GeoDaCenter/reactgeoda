import React, {useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Modal} from 'react-responsive-modal';
import {useDropzone} from 'react-dropzone';
import {FormattedMessage} from 'react-intl';

// import {_BrowserFileSystem as BrowserFileSystem, loadInBatches} from '@loaders.gl/core';
import {ShapefileLoader} from '@loaders.gl/shapefile';
import {CSVLoader} from '@loaders.gl/csv';
import {ArrowLoader} from '@loaders.gl/arrow';
import {_GeoJSONLoader as GeoJSONLoader} from '@loaders.gl/json';
import {addDataToMap, wrapTo} from '@kepler.gl/actions';

import {GeoDaState} from '../store';
import {setOpenFileModal} from '../actions';
import {IconUpload} from './icons/upload';
import {setRawFileData} from '../actions/file-actions';
import {
  FileCacheItem,
  ProcessFileDataContent,
  processFileData,
  readFileInBatches
} from '@kepler.gl/processors';

const CSV_LOADER_OPTIONS = {
  shape: 'object-row-table',
  dynamicTyping: false // not working for now
};

const ARROW_LOADER_OPTIONS = {
  shape: 'arrow-table'
};

const JSON_LOADER_OPTIONS = {
  shape: 'object-row-table',
  // instruct loaders.gl on what json paths to stream
  jsonpaths: [
    '$', // JSON Row array
    '$.features', // GeoJSON
    '$.datasets' // KeplerGL JSON
  ]
};

async function processDropFiles(files: File[]) {
  const loaders = [ShapefileLoader, CSVLoader, ArrowLoader, GeoJSONLoader];
  const file = files[0];
  const fileCache: FileCacheItem[] = [];
  const loadOptions = {
    csv: CSV_LOADER_OPTIONS,
    arrow: ARROW_LOADER_OPTIONS,
    json: JSON_LOADER_OPTIONS,
    metadata: true
  };

  const batches = await readFileInBatches({file, fileCache, loaders, loadOptions});
  let result = await batches.next();
  let content: ProcessFileDataContent;
  let parsedData: FileCacheItem[] = [];

  while (!result.done) {
    console.log('processBatchesUpdater', result.value, result.done);
    content = result.value as ProcessFileDataContent;
    result = await batches.next();
    if (result.done) {
      parsedData = await processFileData({
        content,
        fileCache: []
      });
      console.log('parsedData', parsedData);
      break;
    }
  }

  // return the first dataset only in webgeoda
  return parsedData[0];
}

const OpenFileComponent = () => {
  const dispatch = useDispatch();

  // const getFileExtension = (fileName: string) => {
  //   return fileName.split('.').pop()?.toLowerCase();
  // };

  // const processShapeFiles = async (shpFiles: Map<string, File>) => {
  //   const shpFileName = shpFiles.get('shp')?.name;
  //   const dbfFileName = shpFiles.get('dbf')?.name;
  //   if (shpFileName === undefined || dbfFileName === undefined) {
  //     // TODO: @justin-kleid replace it with a React message box
  //     console.error('Missing required Shapefile files (shp, dbf)');
  //     return;
  //   }
  //   const fileSystem = new BrowserFileSystem(Array.from(shpFiles.values()));
  //   const {fetch} = fileSystem;
  //   const batches = await loadInBatches(shpFileName, ShapefileLoader, {
  //     fetch,
  //     gis: {reproject: false},
  //     shp: {_maxDimensions: Number.MAX_SAFE_INTEGER},
  //     metadata: false
  //   });
  //   const data = [];
  //   for await (const batch of batches) {
  //     // @ts-ignore FIXME
  //     data.push(...batch.data);
  //   }
  //   return {type: 'FeatureCollection', features: data};
  // };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const parsedDataset = await processDropFiles(acceptedFiles);

      // dispatch addDataToMap action to default kepler.gl instance
      dispatch(
        wrapTo(
          'kepler_map',
          addDataToMap({
            datasets: parsedDataset,
            options: {centerMap: true}
          })
        )
      );

      // dispatch action to close modal, update redux state state.root.uiState.showOpenFileModal
      dispatch(setOpenFileModal(false));

      // dispatch action to set file data, update redux state state.fileData
      dispatch(setRawFileData(acceptedFiles[0]));
    },
    [dispatch]
  );

  const {getRootProps, getInputProps} = useDropzone({onDrop});

  return (
    <div className="open-file-modal">
      <div className="overlap-group">
        <div className="heading-upload">
          <div className="text-wrapper">Open File</div>
        </div>
        <div className="file-upload-area" {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="drag-drop-files">
            <p className="drag-drop-files-or">
              <FormattedMessage id="fileUpload.dropHere" defaultMessage="Drop the files here ..." />
            </p>
          </div>
          <div className="supported-formats">
            <p className="div">Supported formates: GeoJSON, ESRI Shapefile, CSV</p>
          </div>
          <IconUpload />
        </div>
        <div className="uploading-file">
          <div className="document-name">
            <div className="text-wrapper-4">60%</div>
          </div>
          <div className="loading-bar" />
        </div>
      </div>
    </div>
  );
};

export function OpenFileModal() {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showOpenModal from the redux store
  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);

  // create a reference to the modal for focus
  const modalRef = useRef(null);

  const onCloseModal = () => {
    dispatch(setOpenFileModal(false));
  };

  return showOpenModal ? (
    <Modal open={showOpenModal} onClose={onCloseModal} center initialFocusRef={modalRef}>
      <OpenFileComponent />
    </Modal>
  ) : null;
}
