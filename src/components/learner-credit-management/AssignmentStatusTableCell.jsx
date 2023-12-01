import React from 'react';
import PropTypes from 'prop-types';
import {
  Chip,
} from '@edx/paragon';
import NotifyingLearner from './assignments-status-chips/NotifyingLearner';
import WaitingForLearner from './assignments-status-chips/WaitingForLearner';
import FailedBadEmail from './assignments-status-chips/FailedBadEmail';
import FailedSystem from './assignments-status-chips/FailedSystem';
import FailedReminder from './assignments-status-chips/FailedReminder';

const AssignmentStatusTableCell = ({ row }) => {
  const { original } = row;
  const {
    learnerEmail,
    learnerState,
    errorReason,
    actions,
  } = original;

  // Learner state is not available for this assignment, so don't display anything.
  if (!learnerState) {
    return null;
  }

  // If the last action was an attempt to remind learner
  if (actions[actions.length - 1].actionType === 'cancelled') {
    if (actions[actions.length - 1].actionType === 'email_error'
        || actions[actions.length - 1].actionType === 'internal_api_error') {
      return <FailedReminder />;
    }
  }

  // Display the appropriate status chip based on the learner state.
  if (learnerState === 'notifying') {
    return (
      <NotifyingLearner learnerEmail={learnerEmail} />
    );
  }

  if (learnerState === 'waiting') {
    return (
      <WaitingForLearner learnerEmail={learnerEmail} />
    );
  }

  if (learnerState === 'failed') {
    // Determine which failure chip to display based on the error reason.
    if (errorReason === 'email_error') {
      return (
        <FailedBadEmail learnerEmail={learnerEmail} />
      );
    } if (errorReason === 'remind_error') {
      return (
        <FailedReminder />
      );
    }

    return <FailedSystem />;
  }

  // Note: The given `learnerState` not officially supported with a `ModalPopup`, but display it anyway.
  return <Chip>{`${learnerState.charAt(0).toUpperCase()}${learnerState.substr(1)}`}</Chip>;
};

AssignmentStatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      learnerEmail: PropTypes.string,
      learnerState: PropTypes.string.isRequired,
      errorReason: PropTypes.string,
      actions: PropTypes.arrayOf(PropTypes.shape({
        actionType: PropTypes.string.isRequired,
        errorReason: PropTypes.string,
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

export default AssignmentStatusTableCell;
