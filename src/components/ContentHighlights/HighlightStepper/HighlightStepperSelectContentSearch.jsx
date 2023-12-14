import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import { Configure, InstantSearch, connectStateResults } from 'react-instantsearch-dom';
import { DataTable, CardView } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import { SearchData, SearchHeader } from '@edx/frontend-enterprise-catalog-search';

import { configuration } from '../../../config';
import { ENABLE_TESTING, FOOTER_TEXT_BY_CONTENT_TYPE, MAX_PAGE_SIZE } from '../data/constants';
import ContentSearchResultCard from './ContentSearchResultCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import SelectContentSelectionStatus from './SelectContentSelectionStatus';
import SelectContentSelectionCheckbox from './SelectContentSelectionCheckbox';
import SelectContentSearchPagination from './SelectContentSearchPagination';
import SkeletonContentCard from '../SkeletonContentCard';
import { useContentHighlightsContext } from '../data/hooks';

const defaultActiveStateValue = 'card';

const selectColumn = {
  id: 'selection',
  Header: () => null,
  Cell: SelectContentSelectionCheckbox,
  disableSortBy: true,
};

const PriceTableCell = ({ row }) => {
  const contentPrice = row.original.firstEnrollablePaidSeatPrice;
  if (!contentPrice) {
    return null;
  }
  return `$${contentPrice}`;
};

PriceTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      firstEnrollablePaidSeatPrice: PropTypes.number,
    }).isRequired,
  }).isRequired,
};

const ContentTypeTableCell = ({ row }) => FOOTER_TEXT_BY_CONTENT_TYPE[row.original.contentType.toLowerCase()];

const BaseHighlightStepperSelectContentDataTable = ({
  selectedRowIds,
  onSelectedRowsChanged,
  isSearchStalled,
  searchResults,
}) => {
  const [currentView, setCurrentView] = useState(defaultActiveStateValue);
  const tableData = useMemo(() => camelCaseObject(searchResults?.hits || []), [searchResults]);
  const searchResultsItemCount = searchResults?.nbHits || 0;
  const searchResultsPageCount = searchResults?.nbPages || 0;
  return (
    <DataTable
      isLoading={isSearchStalled}
      onSelectedRowsChanged={onSelectedRowsChanged}
      dataViewToggleOptions={{
        isDataViewToggleEnabled: true,
        onDataViewToggle: val => setCurrentView(val),
        defaultActiveStateValue,
        togglePlacement: 'left',
      }}
      isSelectable
      isPaginated
      manualPagination
      initialState={{
        pageIndex: 0,
        pageSize: MAX_PAGE_SIZE,
        selectedRowIds,
      }}
      pageCount={searchResultsPageCount}
      itemCount={searchResultsItemCount}
      initialTableOptions={{
        getRowId: row => row?.aggregationKey,
        autoResetSelectedRows: false,
      }}
      data={tableData}
      manualSelectColumn={selectColumn}
      SelectionStatusComponent={SelectContentSelectionStatus}
      columns={[
        {
          Header: 'Content name',
          accessor: 'title',
        },
        {
          Header: 'Partner',
          accessor: 'partners[0].name',
        },
        {
          Header: 'Content type',
          Cell: ContentTypeTableCell,
        },
        {
          Header: 'Price',
          Cell: PriceTableCell,
        },
      ]}
    >
      <DataTable.TableControlBar />
      {currentView === 'card' && (
        <CardView
          columnSizes={{
            xs: 12,
            md: 6,
            lg: 4,
            xl: 3,
          }}
          SkeletonCardComponent={SkeletonContentCard}
          CardComponent={ContentSearchResultCard}
        />
      )}
      {currentView === 'list' && <DataTable.Table /> }
      <DataTable.EmptyTable content="No results found" />
      <DataTable.TableFooter>
        <SelectContentSearchPagination />
      </DataTable.TableFooter>
    </DataTable>
  );
};

BaseHighlightStepperSelectContentDataTable.propTypes = {
  selectedRowIds: PropTypes.shape().isRequired,
  onSelectedRowsChanged: PropTypes.func.isRequired,
  isSearchStalled: PropTypes.bool.isRequired,
  searchResults: PropTypes.shape({
    hits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    nbHits: PropTypes.number.isRequired,
    nbPages: PropTypes.number.isRequired,
  }),
};

BaseHighlightStepperSelectContentDataTable.defaultProps = {
  searchResults: null,
};

const HighlightStepperSelectContentDataTable = connectStateResults(BaseHighlightStepperSelectContentDataTable);

const HighlightStepperSelectContent = ({ enterpriseId }) => {
  const { setCurrentSelectedRowIds } = useContentHighlightsContext();
  const currentSelectedRowIds = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.currentSelectedRowIds,
  );
  const searchClient = useContextSelector(
    ContentHighlightsContext,
    v => v[0].searchClient,
  );
    // TODO: replace testEnterpriseId with enterpriseId before push,
    // uncomment out import and replace with testEnterpriseId to test
  const searchFilters = `enterprise_customer_uuids:${ENABLE_TESTING(enterpriseId)}`;

  return (
    <SearchData>
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure
          filters={searchFilters}
          hitsPerPage={MAX_PAGE_SIZE}
        />
        <SearchHeader variant="default" />
        <HighlightStepperSelectContentDataTable
          selectedRowIds={currentSelectedRowIds}
          onSelectedRowsChanged={setCurrentSelectedRowIds}
        />
      </InstantSearch>
    </SearchData>
  );
};

HighlightStepperSelectContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default HighlightStepperSelectContent;
