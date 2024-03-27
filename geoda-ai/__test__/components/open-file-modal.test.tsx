import React from 'react';
import {OpenFileModal} from '../../src/components/open-file-modal';
import {renderWithProviders} from '../test-utils';

// mock useDispatch and useSelector
// jest.mock('react-redux', () => {
//   const reactRedux = jest.requireActual('react-redux');
//   return {
//     ...reactRedux,
//     useDispatch: jest.fn(),
//     useSelector: jest.fn()
//   };
// });

describe('OpenFileModal', () => {
  // beforeEach(() => {
  //   (useSelector as jest.Mock).mockReturnValueOnce('en');
  //   (useSelector as jest.Mock).mockReturnValueOnce(true);
  // });
  // afterEach(() => {
  //   (useSelector as jest.Mock).mockReset();
  // });
  it('renders without crashing', () => {
    renderWithProviders(<OpenFileModal />, {
      preloadedState: {
        root: {
          language: 'en',
          uiState: {
            showOpenFileModal: true
          }
        }
      }
    });
  });
  // it('displays the modal header', async () => {
  //   const {getByText, container} = renderWithProviders(<OpenFileModal />, {
  //     preloadedState: {
  //       root: {
  //         language: 'en',
  //         uiState: {
  //           showOpenFileModal: true
  //         }
  //       }
  //     }
  //   });
  //   expect(screen.getByText('Open File')).toBeInTheDocument();
  // });
  // it('closes the modal when the close button is clicked', () => {
  //   const {getByTestId, queryByText} = render(<OpenFileModal />);
  //   fireEvent.click(getByTestId('close-button'));
  //   expect(queryByText('Open File')).not.toBeInTheDocument();
  // });
  // Add more tests for other functionality of the OpenFileModal component
});
