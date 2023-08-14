import React, { useContext, useState } from 'react';
import { MailtoLink, Form } from '@edx/paragon';
import RegenerateCredentialWarningModal from './RegenerateCredentialWarningModal';
import CopiedButton from './CopiedButton';
import { ENTERPRISE_CUSTOMER_SUPPORT_EMAIL } from '../data/constants';
import { DataContext } from './Context';

const APICredentialsPage = () => {
  const [formValue, setFormValue] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useContext(DataContext);
  const handleFormChange = (e) => {
    setFormValue(e.target.value);
  };
  return (
    <div>
      <div className="mb-4">
        <h3>Your API credentials</h3>
        <p>
          Copy and paste the following credential information and send it to your API developer(s).
        </p>
      </div>
      <div className="mb-4">
        <h4>
          Application name:&nbsp;
          <span style={{ fontWeight: 'normal' }}>{data?.name}</span>
        </h4>
        <h4>
          Allowed URIs:&nbsp;
          <span style={{ fontWeight: 'normal' }}>{data?.redirect_uris}</span>
        </h4>
        <h4>
          API client ID:&nbsp;
          <span style={{ fontWeight: 'normal' }}>{data?.client_id}</span>
        </h4>
        <h4>
          API client secret:&nbsp;
          <span style={{ fontWeight: 'normal' }}>{data?.client_secret}</span>
        </h4>
        <h4>API client documentation:&nbsp;
          <span style={{ fontWeight: 'normal' }}>{data?.api_client_documentation}</span>
        </h4>
        <h4>
          Last generated on:&nbsp;
          <span style={{ fontWeight: 'normal' }}>{data?.updated}</span>
        </h4>
        <div className="my-3">
          <CopiedButton />
        </div>
      </div>
      <div className="mb-4">
        <h3>Redirect URIs (optional)</h3>
        <p>
          If you need additional redirect URIs, add them below and regenerate your API credentials.
          You will need to communicate the new credentials to your API developers.
        </p>
        <Form.Control
          value={formValue}
          onChange={handleFormChange}
          floatingLabel="Redirect URIs"
          data-testid="form-control"
        />
        <p>
          Allowed URI&apos;s list, space separated
        </p>
        <RegenerateCredentialWarningModal
          redirectURLs={formValue}
          setRedirectURIs={setFormValue}
        />
      </div>
      <div className="mb-4">
        <h3>Questions or modifications?</h3>
        <p>
          To troubleshoot your API credentialing, or to request additional API endpoints to your
          credentials,&nbsp;
          <MailtoLink to={ENTERPRISE_CUSTOMER_SUPPORT_EMAIL} target="_blank">
            contact Enterprise Customer Support.
          </MailtoLink>
        </p>
      </div>
    </div>
  );
};

export default APICredentialsPage;