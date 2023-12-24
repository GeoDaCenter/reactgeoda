import { useDispatch, useSelector } from "react-redux";
import Modal from 'react-responsive-modal';
import { GeoDaState } from "../store";
import { useRef } from "react";
import { setKeplerTableModal } from "../actions";
import { DuckDBTableComponent } from "./duckdb-table";

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