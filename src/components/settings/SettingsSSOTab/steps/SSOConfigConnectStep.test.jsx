import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import SSOConfigConnectStep from './SSOConfigConnectStep';
import { SSOConfigContextProvider, SSO_INITIAL_STATE } from '../SSOConfigContext';
import { getMockStore, initialStore } from '../testutils';

describe('SSO Config Connect step', () => {
  test('renders page with metadata link', () => {
    const store = getMockStore({ ...initialStore });
    const INITIAL_SSO_STATE = {
      ...SSO_INITIAL_STATE,
      providerConfig: {
        enterpriseId: 'id-1',
        slug: 'slug-provider',
      },
    };

    render(
      <Provider store={store}>
        <SSOConfigContextProvider initialState={INITIAL_SSO_STATE}>
          <SSOConfigConnectStep setConnectError={jest.fn()} />
        </SSOConfigContextProvider>
      </Provider>,
    );
    expect(screen.getByText('Loading SSO Configurations...')).toBeInTheDocument();
  });
});
