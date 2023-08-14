/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ActionRow, Toast } from '@edx/paragon';
import ZeroStateCard from './ZeroStateCard';
import APICredentialsPage from './APICredrentialsPage';
import FailedAlert from './FailedAlert';
import { HELP_CENTER_API_GUIDE, API_CLIENT_DOCUMENTATION } from '../data/constants';
import HelpCenterButton from './HelpCenterButton';
import {
  ZeroStateHandlerContext, ErrorContext, ShowSuccessToast, DataContext, EnterpriseId,
} from './Context';
import LmsApiService from '../../../data/services/LmsApiService';

const SettingsApiCredentialsTab = ({
  enterpriseId,
}) => {
  const [displayZeroState, setDisplayZeroState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingData, setExistingData] = useState(null);
  const fetchExistingAPICredentials = async () => {
    setIsLoading(false);
    try {
      const response = await LmsApiService.fetchAPICredentials(enterpriseId);
      const { results } = response.data;
      const result = results[0];
      setExistingData({
        name: result.name,
        redirect_uris: result.redirect_uris,
        client_id: result.client_id,
        client_secret: result.client_secret,
        api_client_documentation: API_CLIENT_DOCUMENTATION,
        updated: result.updated,
      });
      setDisplayZeroState(false);
    } catch (error) {
      setDisplayZeroState(true);
    }
  };
  const [hasRegenerationError, setHasRegenerationError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    fetchExistingAPICredentials();
  });

  return (
    <EnterpriseId.Provider value={enterpriseId}>
      <ZeroStateHandlerContext.Provider value={[displayZeroState, setDisplayZeroState]}>
        <ErrorContext.Provider value={[hasRegenerationError, setHasRegenerationError]}>
          <ShowSuccessToast.Provider value={[showToast, setShowToast]}>
            <DataContext.Provider value={[existingData, setExistingData]}>
              { hasRegenerationError && <FailedAlert /> }
              <ActionRow>
                <h2>API credentials</h2>
                <ActionRow.Spacer />
                <HelpCenterButton url={HELP_CENTER_API_GUIDE}>
                  Help Center: EdX Enterprise API Guide
                </HelpCenterButton>
              </ActionRow>
              <div className="mt-4">
                {!isLoading
                  && (
                    !displayZeroState ? (
                      <APICredentialsPage />
                    ) : (<ZeroStateCard />)
                  )}
              </div>
              <div />
              { showToast && (
                <Toast
                  onClose={() => setShowToast(false)}
                  show={showToast}
                >
                  API credentials successfully generated
                </Toast>
              )}
            </DataContext.Provider>
          </ShowSuccessToast.Provider>
        </ErrorContext.Provider>
      </ZeroStateHandlerContext.Provider>
    </EnterpriseId.Provider>
  );
};
SettingsApiCredentialsTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
export default SettingsApiCredentialsTab;