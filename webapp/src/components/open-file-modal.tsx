import {useSelector} from 'react-redux';
import {GeoDaState} from '../store';

export function OpenFileModal() {
  // get the state showOpenModal from the redux store
  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);

  return showOpenModal ? (
    <div className="modal">
      <div className="modal-content">
        <span className="close">&times;</span>
        <p>Some text in the Modal..</p>
      </div>
    </div>
  ) : null;
}
