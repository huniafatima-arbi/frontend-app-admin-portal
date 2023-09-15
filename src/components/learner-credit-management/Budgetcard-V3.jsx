import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Card,
  Button,
  Stack,
  Row,
  Col,
} from '@edx/paragon';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const SubBudgetCard = ({
  id,
  start,
  end,
  available,
  spent,
  enterpriseSlug,
}) => {
  const formattedStartDate = dayjs(start).format('MMMM D, YYYY');
  const formattedExpirationDate = dayjs(end).format('MMMM D, YYYY');

  const renderActions = (id) => (
    <Button
      data-testid="view-budget"
      as={Link}
      to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}/${id}`}
    >
      View budget
    </Button>
  );

  const renderCardHeader = (budgetType, id) => {
    const subtitle = (
      <div className="d-flex flex-wrap align-items-center">
        <span data-testid="offer-date">
          {formattedStartDate} - {formattedExpirationDate}
        </span>
      </div>
    );

    return (
      <Card.Header
        title={budgetType}
        subtitle={subtitle}
        actions={(
          <div>
            {renderActions(id)}
          </div>
                )}
      />
    );
  };

  const renderCardSection = (available, spent) => (
    <Card.Section
      title="Balance"
      muted
    >
      <Row className="d-flex flex-row justify-content-start w-md-75">
        <Col xs="6" md="auto" className="d-flex flex-column mb-3 mb-md-0">
          <span className="small">Available</span>
          <span>{available}</span>
        </Col>
        <Col xs="6" md="auto" className="d-flex flex-column mb-3 mb-md-0">
          <span className="small">Spent</span>
          <span>{spent}</span>
        </Col>
      </Row>
    </Card.Section>
  );

  return (
    <Card
      orientation="horizontal"
    >
      <Card.Body>
        <Stack gap={4}>
          {renderCardHeader('Overview', id)}
          {renderCardSection(available, spent)}
        </Stack>
      </Card.Body>
    </Card>
  );
};

SubBudgetCard.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  id: PropTypes.string,
  start: PropTypes.string,
  end: PropTypes.string,
  spent: PropTypes.number,
  available: PropTypes.number,

};

export default SubBudgetCard;
