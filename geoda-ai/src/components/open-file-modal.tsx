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
import {setOpenFileModal} from '../actions';
import {IconUpload} from './icons/upload';
import {setRawFileData, RawFileDataProps} from '../actions/file-actions';
import {MAP_ID} from '@/constants';
import {loadDroppedFile} from '@/utils/file-utils';
import {LoadedGeoDaConfig, loadGeoDaProject} from '@/utils/project-utils';
import {SavedConfigV1} from '@kepler.gl/schemas';

type ProcessDropFilesOutput = RawFileDataProps & {
  keplerConfig?: SavedConfigV1['config'];
  geodaConfig?: LoadedGeoDaConfig;
};

async function processDropFiles(files: File[]): Promise<ProcessDropFilesOutput> {
  // check if there is a file with extension .geoda
  const geodaFile = files.find(file => file.name.endsWith('.geoda'));
  if (geodaFile) {
    // process project file
    return await loadGeoDaProject(geodaFile);
  }

  // otherwise check if there is a file with extension .shp
  return await loadDroppedFile(files);
}

const OpenFileComponent = ({projectUrl}: {projectUrl: string | null}) => {
  const dispatch = useDispatch();

  // create a useState to store the status of loading file
  const [loading, setLoading] = useState(false);

  const processFiles = async (acceptedFiles: File[]) => {
    // show loading bar
    setLoading(true);

    // process dropped files, and return the file name, arrowTable and arrowFormatData
    const {fileName, arrowTable, arrowFormatData, keplerConfig, geodaConfig} =
      await processDropFiles(acceptedFiles);

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

    // dispatch action to close modal, update redux state state.root.uiState.showOpenFileModal
    dispatch(setOpenFileModal(false));

    // dispatch action to set file data, update redux state state.fileData
    dispatch(setRawFileData({fileName, arrowTable}));

    if (geodaConfig) {
      // dispatch action to set geoda config, update redux state state.root
      dispatch({type: 'LOAD_PROJECT', payload: geodaConfig});
    }

    // set loading to true to show loading bar
    setLoading(false);
  };

  const onDrop = useCallback(processFiles, [dispatch]);

  const {getRootProps, getInputProps} = useDropzone({onDrop});

  // if projectUrl presents, load the project file using fetch when the component mounts
  useEffect(() => {
    if (projectUrl) {
      setLoading(true);
      // add &ld=1 to the projectUrl if it is a dropbox.com link
      const url = projectUrl.includes('dropbox.com') ? `${projectUrl}&dl=1` : projectUrl;
      fetch(url)
        .then(response => response.blob())
        .then(async data => {
          // create a File object from the blob
          const file = new File([data], 'project.geoda');
          await processFiles([file]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export function OpenFileModal({projectUrl}: {projectUrl: string | null}) {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showOpenModal from the redux store
  const showOpenModal =
    useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal) || Boolean(projectUrl);

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
          <OpenFileComponent projectUrl={projectUrl} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  ) : null;
}
