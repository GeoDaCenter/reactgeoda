import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
  ModalFooter,
  CardFooter,
  Progress
} from '@nextui-org/react';
import {Table as ArrowTable, RecordBatch as ArrowRecordBatch} from 'apache-arrow';
import {useDropzone} from 'react-dropzone';
import {FormattedMessage} from 'react-intl';

import {_BrowserFileSystem as BrowserFileSystem} from '@loaders.gl/core';
import {ShapefileLoader} from '@loaders.gl/shapefile';
import {CSVLoader} from '@loaders.gl/csv';
import {ArrowLoader} from '@loaders.gl/arrow';
import {_GeoJSONLoader as GeoJSONLoader} from '@loaders.gl/json';
import {addDataToMap, wrapTo} from '@kepler.gl/actions';

import {GeoDaState} from '../store';
import {setOpenFileModal} from '../actions';
import {IconUpload} from './icons/upload';
import {setRawFileData, RawFileDataProps} from '../actions/file-actions';
import {
  FileCacheItem,
  ProcessFileDataContent,
  isArrowData,
  processFileData,
  readFileInBatches
} from '@kepler.gl/processors';
import {MAP_ID} from '@/constants';
import {convertFileCacheItemToArrowTable} from '@/utils/file-utils';

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

async function processDropFiles(files: File[]): Promise<RawFileDataProps> {
  const loaders = [ShapefileLoader, CSVLoader, ArrowLoader, GeoJSONLoader];
  const fileCache: FileCacheItem[] = [];
  const droppedFilesFS = new BrowserFileSystem(files);

  // check if there is a file with extension .shp
  const shpFile = files.find(file => file.name.endsWith('.shp'));
  // use shpFile if it exists, otherwise use the first file
  const file = shpFile || files[0];

  const loadOptions = {
    csv: CSV_LOADER_OPTIONS,
    arrow: ARROW_LOADER_OPTIONS,
    json: JSON_LOADER_OPTIONS,
    metadata: true,
    fetch: droppedFilesFS.fetch,
    gis: {reproject: true},
    shp: {_maxDimensions: Number.MAX_SAFE_INTEGER}
  };

  const batches = await readFileInBatches({file, fileCache, loaders, loadOptions});
  let result = await batches.next();
  let content: ProcessFileDataContent = {data: [], fileName: ''};
  let parsedData: FileCacheItem[] = [];

  // let totalRowCount = 0;
  while (!result.done) {
    // get progress
    // totalRowCount += result.value.progress.rowCountInBatch;
    content = result.value as ProcessFileDataContent;
    result = await batches.next();
    if (result.done) {
      parsedData = await processFileData({
        content,
        fileCache: []
      });
      break;
    }
  }

  if (isArrowData(content.data)) {
    const arrowTable = new ArrowTable(content.data as ArrowRecordBatch[]);
    return {fileName: content.fileName, arrowTable, arrowFormatData: parsedData[0]};
  }

  // convert other spatial data format e.g. GeoJSON, Shapefile to arrow table
  return {
    fileName: content.fileName,
    ...convertFileCacheItemToArrowTable(parsedData[0])
  };
}

const OpenFileComponent = () => {
  const dispatch = useDispatch();

  // create a useState to store the status of loading file
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // show loading bar
      setLoading(true);

      // process dropped files, and return the file name, arrowTable and arrowFormatData
      const {fileName, arrowTable, arrowFormatData} = await processDropFiles(acceptedFiles);

      // dispatch addDataToMap action to default kepler.gl instance
      if (arrowFormatData) {
        dispatch(
          wrapTo(
            MAP_ID,
            addDataToMap({
              datasets: arrowFormatData,
              options: {centerMap: true}
            })
          )
        );
      }

      // dispatch action to close modal, update redux state state.root.uiState.showOpenFileModal
      dispatch(setOpenFileModal(false));

      // dispatch action to set file data, update redux state state.fileData
      dispatch(setRawFileData({fileName, arrowTable}));

      // set loading to true to show loading bar
      setLoading(false);
    },
    [dispatch]
  );

  const {getRootProps, getInputProps} = useDropzone({onDrop});

  return (
    <Card>
      <CardBody>
        <div
          className="flex h-[200px] w-full place-content-center"
          {...getRootProps()}
          style={{
            backgroundColor: '#eeeeee',
            opacity: 0.8,
            backgroundImage: 'radial-gradient(#444cf7 0.5px, #eeeeee 0.5px)',
            backgroundSize: '10px 10px'
          }}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-y-2 text-black opacity-70">
            <IconUpload />
            <FormattedMessage id="fileUpload.dropHere" defaultMessage="Drop the files here ..." />
            {loading && (
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Loading..."
                className="mt-2 max-w-md"
              />
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="justify-between text-small">
        <div>
          <p className="text-tiny">Supported formates: GeoJSON, ESRI Shapefile, CSV</p>
        </div>
        {/* <Button className="text-tiny" color="primary" radius="full" size="sm">
          Notify Me
        </Button> */}
      </CardFooter>
    </Card>
  );
};

export function OpenFileModal() {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showOpenModal from the redux store
  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);

  // create a reference to the modal for focus
  // const modalRef = useRef(null);

  const onCloseModal = () => {
    dispatch(setOpenFileModal(false));
  };

  return showOpenModal ? (
    <Modal
      isOpen={showOpenModal}
      onClose={onCloseModal}
      size="3xl"
      placement="center"
      className="min-w-80"
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Open File</ModalHeader>
        <ModalBody>
          <OpenFileComponent />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  ) : null;
}
