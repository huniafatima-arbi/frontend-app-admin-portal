import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch, useHistory, generatePath } from 'react-router-dom';
import {
  FullscreenModal,
  ActionRow,
  Button,
  useToggle,
  Hyperlink,
  StatefulButton,
} from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform/utils';

import { connect } from 'react-redux';
import AssignmentModalContent from './AssignmentModalContent';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys, useBudgetId, useSubsidyAccessPolicy } from '../data';
import CreateAllocationErrorAlertModals from './CreateAllocationErrorAlertModals';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';
import EVENT_NAMES from '../../../eventTracking';

const useAllocateContentAssignments = () => useMutation({
  mutationFn: async ({
    subsidyAccessPolicyId,
    payload,
  }) => {
    const response = await EnterpriseAccessApiService.allocateContentAssignments(subsidyAccessPolicyId, payload);
    return camelCaseObject(response.data);
  },
});

const NewAssignmentModalButton = ({ enterpriseId, course, children }) => {
  const history = useHistory();
  const routeMatch = useRouteMatch();
  const queryClient = useQueryClient();
  const { subsidyAccessPolicyId } = useBudgetId();
  const [isOpen, open, close] = useToggle(false);
  const [learnerEmails, setLearnerEmails] = useState([]);
  const [canAllocateAssignments, setCanAllocateAssignments] = useState(false);
  const [assignButtonState, setAssignButtonState] = useState('default');
  const [createAssignmentsErrorReason, setCreateAssignmentsErrorReason] = useState();
  const { displayToastForAssignmentAllocation } = useContext(BudgetDetailPageContext);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    subsidyUuid, assignmentConfiguration, isSubsidyActive, isAssignable, catalogUuid,
  } = subsidyAccessPolicy;
  const sharedEnterpriseTrackEventMetadata = {
    subsidyAccessPolicyId,
    catalogUuid,
    subsidyUuid,
    isSubsidyActive,
    isAssignable,
    contentPriceCents: course.normalizedMetadata.contentPrice * 100,
    contentKey: course.key,
    courseUuid: course.uuid,
    assignmentConfigurationUuid: assignmentConfiguration.uuid,
  };

  const { mutate } = useAllocateContentAssignments();
  const pathToActivityTab = generatePath(routeMatch.path, { budgetId: subsidyAccessPolicyId, activeTabKey: 'activity' });

  const handleOpenAssignmentModal = () => {
    open();
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGN_COURSE,
      {
        ...sharedEnterpriseTrackEventMetadata,
        isOpen: !isOpen,
      },
    );
  };
  const handleCloseAssignmentModal = () => {
    close();
    setAssignButtonState('default');
  };

  // Callback function for when emails are changed in the
  // child AssignmentModalContent component. Must be memoized as
  // the function is used within a `useEffect`'s dependency array.
  const handleEmailAddressesChanged = useCallback((
    value,
    { canAllocate = false } = {},
  ) => {
    setLearnerEmails(value);
    setCanAllocateAssignments(canAllocate);
  }, []);

  const onSuccessEnterpriseTrackEvents = ({
    created, noChange, updated,
  }) => {
    const trackEventMetadata = {
      ...sharedEnterpriseTrackEventMetadata,
      totalAllocatedLearners: learnerEmails.length,
      created: created.length,
      noChange: noChange.length,
      updated: updated.length,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_ALLOCATION_LEARNER_ASSIGNMENT,
      trackEventMetadata,
    );
  };

  const handleAllocateContentAssignments = () => {
    const payload = snakeCaseObject({
      contentPriceCents: course.normalizedMetadata.contentPrice * 100, // Convert to USD cents
      contentKey: course.key,
      learnerEmails,
    });
    const mutationArgs = {
      subsidyAccessPolicyId,
      payload,
    };
    setAssignButtonState('pending');
    setCreateAssignmentsErrorReason(null);
    mutate(mutationArgs, {
      onSuccess: ({ created, noChange, updated }) => {
        setAssignButtonState('complete');
        // Ensure the budget and budgets queries are invalidated so that the relevant
        // queries become stale and refetches new updated data from the API.
        queryClient.invalidateQueries({
          queryKey: learnerCreditManagementQueryKeys.budget(subsidyAccessPolicyId),
        });
        queryClient.invalidateQueries({
          queryKey: learnerCreditManagementQueryKeys.budgets(enterpriseId),
        });
        handleCloseAssignmentModal();
        onSuccessEnterpriseTrackEvents({
          created, noChange, updated,
        });
        const totalLearnersAssigned = created.length + updated.length;
        const totalLearnerAlreadyAssigned = noChange.length;
        displayToastForAssignmentAllocation({
          totalLearnersAssigned,
          totalLearnerAlreadyAssigned,
        });

        // Navigate to the activity tab
        history.push(pathToActivityTab);
      },
      onError: (err) => {
        const {
          httpErrorStatus,
          httpErrorResponseData,
        } = err.customAttributes;
        let errorReason = 'system_error';
        if (httpErrorStatus === 422) {
          const responseData = JSON.parse(httpErrorResponseData);
          errorReason = responseData[0].reason;
          setCreateAssignmentsErrorReason(errorReason);
        } else {
          setCreateAssignmentsErrorReason(errorReason);
        }
        setAssignButtonState('error');
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_ALLOCATION_ERROR,
          {
            ...sharedEnterpriseTrackEventMetadata,
            totalAllocatedLearners: learnerEmails.length,
            errorStatus: httpErrorStatus,
            errorReason,
          },
        );
      },
    });
  };

  return (
    <>
      <Button onClick={handleOpenAssignmentModal}>{children}</Button>
      <FullscreenModal
        className="bg-light-200 text-left"
        title="Assign this course"
        isOpen={isOpen}
        onClose={() => {
          handleCloseAssignmentModal();
          sendEnterpriseTrackEvent(
            enterpriseId,
            EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_MODAL_EXIT,
            { assignButtonState },
          );
        }}
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              as={Hyperlink}
              onClick={() => sendEnterpriseTrackEvent(
                enterpriseId,
                EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_MODAL_HELP_CENTER,
              )}
              destination="https://edx.org"
              target="_blank"
            >
              Help Center: Course Assignments
            </Button>
            <ActionRow.Spacer />
            <Button
              variant="tertiary"
              onClick={() => {
                handleCloseAssignmentModal();
                sendEnterpriseTrackEvent(
                  enterpriseId,
                  EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.ASSIGNMENT_MODAL_CANCEL,
                  { assignButtonState },
                );
              }}
            >
              Cancel
            </Button>
            <StatefulButton
              labels={{
                default: 'Assign',
                pending: 'Assigning...',
                complete: 'Assigned',
                error: 'Try again',
              }}
              variant="primary"
              state={assignButtonState}
              disabled={!canAllocateAssignments}
              onClick={handleAllocateContentAssignments}
            />
          </ActionRow>
        )}
      >
        <AssignmentModalContent
          course={course}
          onEmailAddressesChange={handleEmailAddressesChanged}
        />
      </FullscreenModal>
      <CreateAllocationErrorAlertModals
        errorReason={createAssignmentsErrorReason}
        retry={handleAllocateContentAssignments}
        closeAssignmentModal={handleCloseAssignmentModal}
      />
    </>
  );
};

NewAssignmentModalButton.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
  children: PropTypes.node.isRequired, // Represents the button text
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(NewAssignmentModalButton);
