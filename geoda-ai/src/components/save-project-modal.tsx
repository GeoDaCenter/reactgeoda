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

const ARROW_TABLE_CONTENT_PLACEHOLDER = '[arrow Object]';

const SaveProjectComponent = () => {
  const dispatch = useDispatch();

  // get the kepler.gl config from redux store
  const keplerState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]);
  // get the root from redux store
  const root = useSelector((state: GeoDaState) => state.root);
  const {file, ...geodaConfig } = root;

  // get id from redux store
  const id = useSelector((state: GeoDaState) => state.root.file.id);
  
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

  // create a project json string
  const projectJson = useMemo(() => {
    return JSON.stringify({
      fileName: rawFileData.fileName,
      arrowTable: ARROW_TABLE_CONTENT_PLACEHOLDER,
      keplerConfig: savedKeplerConfig,
      geodaConfig: {
        ...geodaConfig,
        uiState: {
          ...geodaConfig.uiState,
          showSaveProjectModal: false
        }
      }
    });
  }, [rawFileData, savedKeplerConfig]);

  // set state for monaco editor
  const [code, setCode] = useState(projectJson || '');

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

  // handle save button click
  const onSaveClick = () => {
    // save the project
    // replace ARROW_TABLE_CONTENT_PLACEHOLDER with arrowTableString
    const project = code.replace(ARROW_TABLE_CONTENT_PLACEHOLDER, arrowTableString);

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
            />
          </div>
        </CardBody>
        <CardFooter className="justify-between text-small"></CardFooter>
      </Card>
      <Button className="text-tiny" color="primary" radius="full" size="sm" onClick={onSaveClick}>
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
