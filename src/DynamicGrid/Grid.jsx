import { htmlMarkup } from "../utils/html_markup.jsx";
import { FilterProvider } from "../context/FilterContext.jsx";

import useGridData from "./hooks/useGridData.jsx";
import useActionFunctions from "./hooks/useActionFunctions.jsx";

// renamed parts -> descriptive components
import GridHeader from "./components/GridHeader.jsx";
import ActiveFilterChips from "./components/ActiveFilterChips.jsx";
import DataTable from "./components/DataTable.jsx";
import PaginationBar from "./components/PaginationBar.jsx";

import {
  extractSlots,
  renderCell as renderCellWithSlots,
  Column,
  Action,
} from "./GridColumns.jsx";
import React, { useRef } from "react";

const GridContent = ({
  apiUrl,
  apiClient,
  pageLength = 15,
  showActions,
  actionsFunctions,
  refresh,
  setRefreshGrid,
  noRecordsMessage,
  children,
  exportButton,
  showExportButton = false,
  persistFilters = true, // Enable filter persistence by default
  rightSlot,
}) => {
  const grid = useGridData({
    apiUrl,
    apiClient,
    pageLength,
    refresh,
    setRefreshGrid,
    persistFilters,
  });
  useActionFunctions(actionsFunctions);

  // NEW: imperative ref to control FilterMenu from chips
  const filterMenuRef = useRef(null);

  const { customColumns, customActionRenderer } = extractSlots(children);
  const renderCell = (record, col) =>
    renderCellWithSlots(customColumns, record, col, htmlMarkup);

  const removeFilter = (key) => {
    grid.setFilter((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onEditFilter = (key) => {
    filterMenuRef.current?.openForField?.(key);
  };

  // If <Grid.Action> is provided, use it; otherwise fallback is handled by DataTable
  const actionRenderer = customActionRenderer || null;

  const composedRightSlot = [
    ...(Array.isArray(rightSlot) ? rightSlot : [rightSlot]).filter(Boolean),
  ];

  return (
    <div className="mx-auto w-full max-w-full bg-white ">
      <GridHeader
        isLoading={grid.isLoading}
        searchForm={grid.searchForm}
        filter={grid.filter}
        setFilter={grid.setFilter}
        rightSlot={composedRightSlot}
        exportButton={exportButton}
        showExportButton={showExportButton}
        isExporting={grid.isExporting}
        onExport={grid.exportList}
        // pass ref down to FilterMenu
        filterMenuRef={filterMenuRef}
      />

      <ActiveFilterChips
        filter={grid.filter}
        onRemove={removeFilter}
        onEdit={onEditFilter} // NEW: clicking a chip opens editor for that field
      />

      <div className="overflow-x-auto">
        <DataTable
          isLoading={grid.isLoading}
          pageLength={pageLength}
          filterHeader={grid.filterHeader}
          sortKey={grid.sortKey}
          reverse={grid.reverse}
          onSort={grid.handleSort}
          list={grid.list}
          renderCell={renderCell}
          actionRenderer={actionRenderer}
          noRecordsMessage={noRecordsMessage}
        />
      </div>

      <div className="mb-4 mt-8 flex items-center justify-end">
        <label htmlFor="pageLength" className="mr-2 text-sm text-gray-600">
          Records per page:
        </label>
        <select
          id="pageLength"
          className="form-select rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          value={grid.numberOfRecords}
          onChange={(e) => {
            grid.setPageIndex(1);
            grid.getList(parseInt(e.target.value, 10));
          }}
        >
          {grid.pageSizes.map((size) => (
            <option key={size} value={size} className="text-gray-600">
              {size}
            </option>
          ))}
        </select>
      </div>

      <PaginationBar
        pageIndex={grid.pageIndex}
        setPageIndex={grid.setPageIndex}
        pageSize={grid.numberOfRecords}
        totalResults={grid.totalCount}
      />
    </div>
  );
};

const Grid = (props) => {
  // Validate required parameters
  if (!props.apiUrl) {
    throw new Error("Grid: 'apiUrl' prop is required but was not provided");
  }

  if (!props.apiClient) {
    throw new Error("Grid: 'apiClient' prop is required but was not provided");
  }

  return (
    <FilterProvider>
      <GridContent {...props} />
    </FilterProvider>
  );
};

Grid.Column = Column;
Grid.Action = Action;
export default Grid;
