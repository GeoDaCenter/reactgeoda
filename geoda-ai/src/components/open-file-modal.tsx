'use client';

import React, {useCallback, useEffect, useState} from 'react';
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
import {useDropzone} from 'react-dropzone';
import {FormattedMessage} from 'react-intl';
import {addDataToMap, wrapTo} from '@kepler.gl/actions';

import {GeoDaState} from '../store';
import {setAddDatasetModal, setOpenFileModal} from '../actions';
import {IconUpload} from './icons/upload';
import {addDataset} from '../actions/file-actions';
import {MAP_ID} from '@/constants';
import {loadDroppedFile} from '@/utils/file-utils';
import {loadGeoDaProject, ProcessDropFilesOutput} from '@/utils/project-utils';
import {useDuckDB} from '@/hooks/use-duckdb';
import {ProtoDataset} from '@kepler.gl/types';
import {WarningBox, WarningType} from './common/warning-box';

async function processDropFiles(
  files: File[],
  isAddingDataset = false
): Promise<ProcessDropFilesOutput> {
  // check if there is a file with extension .geoda
  const geodaFile = files.find(file => file.name.endsWith('.geoda'));
  if (geodaFile) {
    if (isAddingDataset === true) {
      throw new Error('GeoDa project file cannot be added to the current project.');
    }
    // process project file
    return await loadGeoDaProject(geodaFile);
  }

  // otherwise check if there is a file with extension .shp
  return await loadDroppedFile(files);
}

/**
 * Open File Component
 * @returns JSX.Element
 */
const OpenFileComponent = ({
  onCloseModal,
  isAddingDataset = false
}: {
  onCloseModal: () => void;
  isAddingDataset?: boolean;
}) => {
  const dispatch = useDispatch();
  const {importArrowFile} = useDuckDB();

  // create a useState to store the status of loading file
  const [loading, setLoading] = useState(false);

  // useState to store error message
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // show loading bar
      setLoading(true);

      try {
        // process dropped files, and return the file name, arrowTable and arrowFormatData
        const {datasets, keplerConfig, geodaConfig} = await processDropFiles(
          acceptedFiles,
          isAddingDataset
        );
        const keplerDatasets: ProtoDataset[] = [];
        for (let i = 0; i < datasets.length; i++) {
          const {fileName, arrowTable, arrowFormatData} = datasets[i];
          // add arrowTable to duckdb
          await importArrowFile({fileName, arrowTable});
          // append duckdb instance to arrowFormatData
          const keplerDataset: ProtoDataset | undefined = arrowFormatData;
          if (keplerDataset) {
            keplerDatasets.push(keplerDataset);
          }
          // dispatch action to set file data, update redux state state.fileData
          dispatch(addDataset({fileName, dataId: keplerDataset?.info.id, arrowTable}));
        }

        if (keplerDatasets.length > 0) {
          // dispatch addDataToMap action to default kepler.gl instance
          dispatch(
            wrapTo(
              MAP_ID,
              addDataToMap({
                datasets: keplerDatasets || [],
                options: {centerMap: true},
                ...(keplerConfig && {config: keplerConfig})
              })
            )
          );
        }

        if (geodaConfig) {
          // dispatch action to set geoda config, update redux state state.root
          dispatch({type: 'LOAD_PROJECT', payload: geodaConfig});
        }

        // set selection mode
        // dispatch(setEditorMode('DRAW_RECTANGLE'));

        // close modal
        onCloseModal();
      } catch (e) {
        // load file failed, show error message
        setError((e as Error).message);
      }

      // set loading to true to show loading bar
      setLoading(false);
    },
    [dispatch, importArrowFile, isAddingDataset, onCloseModal]
  );

  // Hide the error message after 10 second if error occurs
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 10000);
    }
  }, [error]);

  const {getRootProps, getInputProps} = useDropzone({onDrop});

  return (
    <Card className="bg-gray-100 dark:bg-stone-900">
      <CardBody>
        <div
          className="flex h-[200px] w-full place-content-center"
          {...getRootProps()}
          style={{
            backgroundColor: '#eeeeee',
            opacity: 0.8
            // backgroundImage: 'radial-gradient(#444cf7 0.5px, #eeeeee 0.5px)',
            // backgroundSize: '10px 10px'
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
      <CardFooter className="flex flex-col justify-between gap-3 text-small">
        <div>
          <p className="text-tiny">
            Supported formates: GeoArrow, GeoJSON, ESRI Shapefiles, CSV and GeoDa.Ai Project file
          </p>
        </div>
        {error && (
          <WarningBox message={`Failed to open dropped file: ${error}`} type={WarningType.ERROR} />
        )}
      </CardFooter>
    </Card>
  );
};

function OpenFileModal({projectUrl}: {projectUrl: string | null}) {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showOpenModal from the redux store
  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);

  // check if there is a default dataset
  const hasDefaultDataset = useSelector((state: GeoDaState) => state.root.datasets.length > 0);

  // handle close modal event
  const onCloseModal = () => {
    dispatch(setOpenFileModal(false));
  };

  // if projectUrl presents, load the project file using fetch when the component mounts
  useEffect(() => {
    (async () => {
      if (!projectUrl) return;
      const res = await fetch(projectUrl);
      if (!res.ok) {
        throw new Error('Failed to fetch project file');
      }
      const data = await res.json();
      // create a File object from the json data
      const file = new File([JSON.stringify(data)], 'project.geoda', {
        type: 'application/json'
      });
      // process dropped files, and return the file name, arrowTable and arrowFormatData
      const {datasets, keplerConfig, geodaConfig} = await processDropFiles([file]);
      for (let i = 0; i < datasets.length; ++i) {
        const {fileName, arrowTable, arrowFormatData} = datasets[i];
        // dispatch addDataToMap action to default kepler.gl instance
        if (arrowFormatData) {
          dispatch(
            wrapTo(
              MAP_ID,
              addDataToMap({
                datasets: arrowFormatData,
                options: {centerMap: true},
                ...(keplerConfig && {config: keplerConfig})
              })
            )
          );
        }
        // dispatch action to set file data, update redux state state.fileData
        dispatch(addDataset({fileName, arrowTable}));
      }
      // dispatch action to set geoda config, update redux state state.root
      if (geodaConfig) {
        setTimeout(() => {
          dispatch({type: 'LOAD_PROJECT', payload: geodaConfig});
        }, 1000);
      }
    })();
  }, [dispatch, projectUrl]);

  if (hasDefaultDataset === false && projectUrl !== null) {
    // showing loading project modal
    return (
      <Modal
        isOpen={hasDefaultDataset === false && projectUrl !== null}
        size="3xl"
        placement="center"
        className="min-w-60"
        isDismissable={true}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Loading Project...</ModalHeader>
          <ModalBody>
            <Progress size="sm" isIndeterminate aria-label="Loading..." className="mt-2 max-w-md" />
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    );
  }

  return showOpenModal ? (
    <Modal
      isOpen={showOpenModal}
      onClose={onCloseModal}
      size="3xl"
      placement="center"
      className="min-w-80 bg-gray-50 dark:bg-stone-800"
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Open File</ModalHeader>
        <ModalBody>
          <OpenFileComponent onCloseModal={onCloseModal} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  ) : null;
}

export default OpenFileModal;

/**
 * Add Dataset Modal
 */
export function AddDatasetModal() {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showOpenModal from the redux store
  const showModal = useSelector((state: GeoDaState) => state.root.uiState.showAddDatasetModal);

  const onCloseModal = () => {
    dispatch(setAddDatasetModal(false));
  };

  return showModal ? (
    <Modal
      isOpen={showModal}
      onClose={onCloseModal}
      size="3xl"
      placement="center"
      className="min-w-80 bg-gray-50 dark:bg-stone-800"
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Add Dataset</ModalHeader>
        <ModalBody>
          <OpenFileComponent onCloseModal={onCloseModal} isAddingDataset={true} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  ) : null;
}
