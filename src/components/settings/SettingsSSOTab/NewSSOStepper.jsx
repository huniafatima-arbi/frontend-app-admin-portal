import React, {
  useState, useContext,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FormContextWrapper from '../../forms/FormContextWrapper';
import { SSOConfigContext } from './SSOConfigContext';
import SSOFormWorkflowConfig from './SSOFormWorkflowConfig';
import SsoErrorPage from './SsoErrorPage';
import { camelCaseDict } from '../../../utils';
import UnsavedSSOChangesModal from './UnsavedSSOChangesModal';
import { IDP_URL_SELECTION, IDP_XML_SELECTION } from './steps/NewSSOConfigConnectStep';

const NewSSOStepper = ({ enterpriseId }) => {
  const {
    setProviderConfig, refreshBool, setRefreshBool, ssoState: { providerConfig },
  } = useContext(SSOConfigContext);
  const providerConfigCamelCase = camelCaseDict(providerConfig || {});
  const [isStepperOpen, setIsStepperOpen] = useState(true);
  const [configureError, setConfigureError] = useState(null);
  const handleCloseWorkflow = () => {
    setProviderConfig?.(null);
    setIsStepperOpen(false);
    setRefreshBool(!refreshBool);
  };
  if (providerConfigCamelCase.metadataXml || providerConfigCamelCase.metadataUrl) {
    providerConfigCamelCase.idpConnectOption = providerConfigCamelCase?.metadataUrl
      ? IDP_URL_SELECTION
      : IDP_XML_SELECTION;
  }

  return (
    <>
      {isStepperOpen && !configureError && (
        <div>
          <FormContextWrapper
            workflowTitle="New SSO integration"
            formWorkflowConfig={SSOFormWorkflowConfig({ enterpriseId, setConfigureError })}
            onClickOut={handleCloseWorkflow}
            formData={providerConfigCamelCase}
            isStepperOpen={isStepperOpen}
            UnsavedChangesModal={UnsavedSSOChangesModal}
          />
        </div>
      )}
      {isStepperOpen && configureError && (
        <SsoErrorPage isOpen={configureError !== null} stepperError />
      )}
    </>
  );
};

NewSSOStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NewSSOStepper);
