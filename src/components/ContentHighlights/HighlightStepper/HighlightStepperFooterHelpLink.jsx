import React from 'react';
import {
  Hyperlink,
} from '@edx/paragon';

function HighlightStepperFooterHelpLink() {
  return (
    <div className="mr-1 p-0">
      <Hyperlink target="_blank" destination={process.env.ENTERPRISE_SUPPORT_URL}>
        Help Center
      </Hyperlink>
    </div>
  );
}

export default HighlightStepperFooterHelpLink;
