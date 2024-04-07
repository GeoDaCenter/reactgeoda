import React, {useMemo, useState} from 'react';
import MonacoEditor from '@monaco-editor/react';
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
import {arrayBufferToBase64} from '@/utils/file-utils';

const ARROW_TABLE_CONTENT_PLACEHOLDER = '. . .';

const SaveProjectComponent = () => {
  const dispatch = useDispatch();

  // create a useState to store the status of saving project
  const [saving, setSaving] = useState(false);

  // get raw file data from redux store
  const rawFileData = useSelector((state: GeoDaState) => state.root.file.rawFileData);

  // get the base64 string of the arrow table
  const arrowTableString = useMemo(() => {
    if (rawFileData && rawFileData.arrowTable) {
      const bufferArray = tableToIPC(rawFileData.arrowTable);
      return arrayBufferToBase64(bufferArray.buffer);
    }
    console.error('arrow table is not available');
    return '';
  }, [rawFileData]);

  const projectJson = useMemo(() => {
    return JSON.stringify({
      fileName: rawFileData.fileName,
      arrowTable: ARROW_TABLE_CONTENT_PLACEHOLDER
    });
  }, [rawFileData]);

  // set state for monaco editor
  const [code, setCode] = useState(projectJson || '');

  const onMonacoEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const onSaveClick = () => {
    setSaving(true);
    // save the project
    // replace ARROW_TABLE_CONTENT_PLACEHOLDER with arrowTableString
    const project = code.replace(ARROW_TABLE_CONTENT_PLACEHOLDER, arrowTableString);
    console.log(project);

    // close modal
    setTimeout(() => {
      setSaving(false);
      dispatch(setSaveProjectModal(false));
    }, 1000);
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
                minimap: {enabled: false}
              }}
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
