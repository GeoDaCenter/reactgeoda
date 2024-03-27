import '@testing-library/jest-dom';
import {render, waitFor} from '@testing-library/react';
import Page from '../../src/app/page';

describe('Page', () => {
  it('renders a heading', async () => {
    const {container} = render(<Page />);

    const reactGeoDa = await waitFor(() =>
      container.getElementsByClassName('landing-page-wrapper')
    );
    expect(reactGeoDa.length).toBe(1);
  });
});
