import React, {useMemo, useState} from 'react';
import MonacoEditor from '@monaco-editor/react';
import {editor} from 'monaco-editor';
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
  Button
} from '@nextui-org/react';
import {tableToIPC} from 'apache-arrow';

import {GeoDaState} from '../store';
import {setSaveProjectModal} from '../actions';
import {arrayBufferToBase64, downloadStringToFile} from '@/utils/file-utils';
import {MAP_ID} from '@/constants';
import KeplerGLSchemaManager from '@kepler.gl/schemas';
import {saveGeoDaConfig} from '@/utils/project-utils';

const ARROW_TABLE_CONTENT_PLACEHOLDER = '[arrow Object]';
const WEIGHTS_CONTENT_PLACEHOLDER = '[weights Object][]';

const SaveProjectComponent = () => {
  const dispatch = useDispatch();
  const [isValid, setIsValid] = useState(true);

  // get the kepler.gl config from redux store
  const keplerState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]);
  // get the root from redux store
  const root = useSelector((state: GeoDaState) => state.root);

  // get raw file data from redux store
  const rawFileData = useMemo(() => root.file.rawFileData, [root.file.rawFileData]);

  // get the base64 string of the arrow table
  const arrowTableString = useMemo(() => {
    if (rawFileData && rawFileData.arrowTable) {
      const bufferArray = tableToIPC(rawFileData.arrowTable);
      return arrayBufferToBase64(bufferArray.buffer);
    }
    console.error('arrow table is not available');
    return '';
  }, [rawFileData]);

  // get the kepler config to save
  const savedKeplerConfig = useMemo(() => {
    const config = KeplerGLSchemaManager.getConfigToSave(keplerState);
    return config.config;
  }, [keplerState]);

  // get the geoda config to save
  const savedGeoDaConfig = useMemo(() => {
    const config = saveGeoDaConfig(root);
    return config;
  }, [root]);

  // create a project json string
  const projectJson = useMemo(() => {
    return {
      fileName: rawFileData.fileName,
      arrowTable: arrowTableString,
      keplerConfig: savedKeplerConfig,
      geodaConfig: savedGeoDaConfig
    };
  }, [arrowTableString, rawFileData.fileName, savedGeoDaConfig, savedKeplerConfig]);

  // create a preview of the project json string
  const projectPreview = useMemo(() => {
    // replace projectJson.arrowTable with ARROW_TABLE_CONTENT_PLACEHOLDER
    // replace projectJson.geodaConfig.weighs with '[weights Object]'
    const preview = {
      ...projectJson,
      arrowTable: ARROW_TABLE_CONTENT_PLACEHOLDER,
      geodaConfig: {
        ...projectJson.geodaConfig,
        weights: WEIGHTS_CONTENT_PLACEHOLDER
      }
    };
    return JSON.stringify(preview);
  }, [projectJson]);

  // set state for monaco editor
  const [code, setCode] = useState(projectPreview || '');

  // format the code in manaco editor after the component is mounted
  const onEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    setTimeout(() => {
      editor?.getAction('editor.action.formatDocument')?.run();
    }, 1000);
  };

  // handle monaco editor change
  const onMonacoEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const onMonacoEditorValidate = (markers: editor.IMarkerData[]) => {
    setIsValid(markers.length === 0);
  };

  // handle save button click
  const onSaveClick = () => {
    // save the project
    // replace ARROW_TABLE_CONTENT_PLACEHOLDER with arrowTableString
    // replace WEIGHTS_CONTENT_PLACEHOLDER with weights
    const project = code
      .replace(ARROW_TABLE_CONTENT_PLACEHOLDER, arrowTableString)
      .replace(`"${WEIGHTS_CONTENT_PLACEHOLDER}"`, JSON.stringify(savedGeoDaConfig.weights));

    // create a file name 'geoda-[current date and time].json'
    const fileName = `project-${new Date().toISOString()}.geoda`;
    const contentType = 'application/json';
    // save the project to a file download in browser
    downloadStringToFile(project, fileName, contentType);

    // close modal
    setTimeout(() => {
      dispatch(setSaveProjectModal(false));
    }, 100);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Card>
        <CardBody>
          <div className="h-80 w-full">
            <MonacoEditor
              language="json"
              value={code}
              onChange={onMonacoEditorChange}
              options={{
                minimap: {enabled: true}
              }}
              onMount={onEditorMount}
              onValidate={onMonacoEditorValidate}
            />
          </div>
        </CardBody>
        <CardFooter className="justify-between text-small"></CardFooter>
      </Card>
      <Button
        className="text-tiny"
        color="primary"
        size="sm"
        onClick={onSaveClick}
        isDisabled={!isValid}
      >
        Save
      </Button>
    </div>
  );
};

export function SaveProjectModal() {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();

  // get the state showProjectModal from the redux store
  const showProjectModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showSaveProjectModal
  );

  const onCloseModal = () => {
    dispatch(setSaveProjectModal(false));
  };

  return showProjectModal ? (
    <Modal
      isOpen={showProjectModal}
      onClose={onCloseModal}
      size="3xl"
      placement="center"
      className="min-w-80"
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Save Project</ModalHeader>
        <ModalBody>
          <SaveProjectComponent />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  ) : null;
}
