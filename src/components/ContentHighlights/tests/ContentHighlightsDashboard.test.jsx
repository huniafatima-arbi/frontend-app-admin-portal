/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { BUTTON_TEXT, STEPPER_STEP_TEXT, HEADER_TEXT } from '../data/constants';
import ContentHighlightsDashboard from '../ContentHighlightsDashboard';
import {
  initialStateValue,
  ContentHighlightsContext,
  testHighlightSet,
} from '../../../data/tests/ContentHighlightsTestData';
import { initialStateValue as initialEnterpriseAppContextValue } from '../../../data/tests/EnterpriseAppTestData/context';

const ContentHighlightsDashboardWrapper = ({
  value = initialStateValue,
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  props,
}) => (
  <ContentHighlightsContext enterpriseAppContextValue={enterpriseAppContextValue} value={value}>
    <ContentHighlightsDashboard {...props} />
  </ContentHighlightsContext>
);

describe('<ContentHighlightsDashboard>', () => {
  it('Displays ZeroState on empty highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    expect(screen.getByText(HEADER_TEXT.zeroStateHighlights)).toBeInTheDocument();
    expect(screen.getByText(HEADER_TEXT.SUB_TEXT.zeroStateHighlights)).toBeInTheDocument();
  });

  it('Displays New highlight Modal on button click with no highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(newHighlight);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
  it('Displays current highlights when data is populated', () => {
    renderWithRouter(
      <ContentHighlightsDashboardWrapper
        enterpriseAppContextValue={{
          value: {
            enterpriseCuration: {
              enterpriseCuration: {
                highlightSets: [testHighlightSet],
              },
            },
          },
        }}
      />,
    );
    expect(screen.getByText(exampleHighlightSet.title)).toBeInTheDocument();
  });
  it('Allows selection between tabs of dashboard, when highlight set exist', () => {
    renderWithRouter(
      <ContentHighlightsDashboardWrapper
        enterpriseAppContextValue={{
          enterpriseCuration: {
            enterpriseCuration: {
              highlightSets: [exampleHighlightSet],
            },
          },
        }}
      />,
    );
    const [highlightTab, catalogVisibilityTab] = screen.getAllByRole('tab');

    expect(highlightTab.classList.contains('active')).toBeTruthy();
    expect(catalogVisibilityTab.classList.contains('active')).toBeFalsy();

    userEvent.click(catalogVisibilityTab);
    expect(catalogVisibilityTab.classList.contains('active')).toBeTruthy();
    expect(highlightTab.classList.contains('active')).toBeFalsy();
  });
  it('Displays New highlight modal on button click with highlighted content list', () => {
    renderWithRouter(<ContentHighlightsDashboardWrapper />);
    const newHighlight = screen.getByTestId(`zero-state-card-${BUTTON_TEXT.zeroStateCreateNewHighlight}`);
    userEvent.click(newHighlight);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
});
