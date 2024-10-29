'use client';

import React, {useCallback, useEffect} from 'react';
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

import {GeoDaState} from '../store';
import {setAddDatasetModal, setOpenFileModal, setOpenFileModalError} from '../actions/ui-actions';
import {IconUpload} from './icons/upload';
import {loadDroppedFilesAsync, loadProjectUrlAsync} from '../actions/file-actions';
import {WarningBox, WarningType} from './common/warning-box';
import {Icon} from '@iconify/react';

const LoadShapefilesVideo = () => {
  const dispatch = useDispatch();

  const onShapefileErrorClose = () => {
    dispatch(setOpenFileModalError(''));
  };

  return (
    <div className="relative flex h-[300px] w-full place-content-center">
      <video controls className="w-full" muted>
        <source src="img/drop-shapefiles.mp4" type="video/mp4" />
      </video>
      <Icon
        icon="icon-park:close-one"
        className="absolute right-0 top-[-4px] h-6 w-6 cursor-pointer"
        onClick={onShapefileErrorClose}
      />
      <span className="absolute left-0 top-[-4px] text-tiny flex items-center gap-x-1">
        <Icon icon="mdi:idea" style={{color: '#eaf2b1'}} />
        See how to drop Shapefiles in this video:
      </span>
    </div>
  );
};

/**
 * Open File Component
 * @returns JSX.Element
 */
const OpenFileComponent = ({isAddingDataset = false}: {isAddingDataset?: boolean}) => {
  const dispatch = useDispatch<any>();

  const loading = useSelector((state: GeoDaState) => state.root.uiState.openFileModal.isLoading);

  const error = useSelector(
    (state: GeoDaState) => state.root.uiState.openFileModal.openFileModalError
  );

  const {getRootProps, getInputProps} = useDropzone({
    onDrop: useCallback(
      async (acceptedFiles: File[]) => {
        dispatch(loadDroppedFilesAsync(acceptedFiles, isAddingDataset));
      },
      [dispatch, isAddingDataset]
    )
  });

  return (
    <Card className="bg-gray-100 dark:bg-stone-900">
      <CardBody>
        {error && error !== '' && error.includes('Shapefile') ? (
          <LoadShapefilesVideo />
        ) : (
          <div
            className="flex h-[200px] w-full place-content-center bg-slate-300"
            {...getRootProps()}
            style={{
              backgroundColor: '#eeeeee',
              opacity: 0.8
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
                  className="progress mt-2 max-w-md"
                />
              )}
            </div>
          </div>
        )}
      </CardBody>
      <CardFooter className="flex flex-col justify-between gap-3 text-small">
        <div>
          <p className="text-tiny">
            Supported formates: GeoArrow, GeoJSON, ESRI Shapefiles, CSV and GeoDa.Ai Project file
          </p>
        </div>
        {error && error !== '' && (
          <WarningBox
            message={`Failed to open dropped file: ${error} If the problem persists, please submit an issue at github.com/geodaai.`}
            type={WarningType.ERROR}
          />
        )}
      </CardFooter>
    </Card>
  );
};

/**
 * Load Project from URL Modal
 */
function LoadProjectFromUrlModal({isOpen, projectUrl}: {isOpen: boolean; projectUrl: string}) {
  // get the dispatch function from the redux store
  const dispatch = useDispatch<any>();

  const error = useSelector(
    (state: GeoDaState) => state.root.uiState.openFileModal.openFileModalError
  );

  // if projectUrl presents, load the project file using fetch after the component mounts
  useEffect(() => {
    dispatch(loadProjectUrlAsync(projectUrl));
  }, [dispatch, projectUrl]);

  return (
    <Modal isOpen={isOpen} size="3xl" placement="center" className="min-w-60" isDismissable={true}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Loading Project...</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <Progress size="sm" isIndeterminate aria-label="Loading..." className="mt-2 max-w-md" />
          {error && (
            <WarningBox
              message={`Failed to open GeoDa.AI project: ${error}. If the problem persists, please submit an issue at github.com/geodaai.`}
              type={WarningType.ERROR}
            />
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

/**
 * Open File Modal
 * @param {string} projectUrl
 * @returns JSX.Element
 */
function OpenFileModal({projectUrl}: {projectUrl: string | null}) {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showOpenModal from the redux store
  const showOpenModal = useSelector(
    (state: GeoDaState) => state.root.uiState.openFileModal.showOpenFileModal
  );

  // handle close modal event
  const onCloseModal = () => {
    dispatch(setOpenFileModal(false));
  };

  if (projectUrl !== null) {
    // showing loading project modal
    return <LoadProjectFromUrlModal isOpen={showOpenModal} projectUrl={projectUrl} />;
  }

  return showOpenModal ? (
    <Modal
      isOpen={showOpenModal}
      onClose={onCloseModal}
      size="3xl"
      placement="center"
      className="z-[10000] min-w-80 bg-gray-50 dark:bg-stone-800"
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

/**
 * Add Dataset Modal
 */
export function AddDatasetModal() {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showOpenModal from the redux store
  const showModal = useSelector(
    (state: GeoDaState) => state.root.uiState.openFileModal.showAddDatasetModal
  );

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
          <OpenFileComponent isAddingDataset={true} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  ) : null;
}

export default OpenFileModal;
