import { useEffect, useMemo, useState } from "react";
import { useFilter } from "../../context/FilterContext.jsx";

export default function useGridData({
  apiUrl,
  apiClient,
  pageLength = 15,
  refresh,
  setRefreshGrid,
  persistFilters = true, // New param to enable/disable filter persistence
}) {
  // Validate required parameters
  if (!apiUrl) {
    throw new Error("useGridData: 'apiUrl' is required but was not provided");
  }

  if (!apiClient) {
    throw new Error("useGridData: 'apiClient' is required but was not provided");
  }

  const { getFilter, setGridFilter, getSearchForm, setGridSearchForm } = useFilter();
  console.log("getFilter:", getFilter, "setGridFilter:", setGridFilter, "getSearchForm:", getSearchForm, "setGridSearchForm:", setGridSearchForm);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [sortKey, setSortKey] = useState("");
  const [reverse, setReverse] = useState(null);
  const [list, setList] = useState([]);

  // Column meta for table
  const [filterHeader, setFilterHeader] = useState([]);

  // Stable field catalogue for FilterMenu (never shrink this)
  // Initialize from context if persistence is enabled
  const [searchForm, setSearchForm] = useState(() =>
    persistFilters ? getSearchForm(apiUrl) : {}
  );

  const [applyColumns, setApplyColumns] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfRecords, setNumberOfRecords] = useState(pageLength);

  // Store filter as an OBJECT keyed by header (e.g. { Email: { ...rule } })
  // Initialize from context if persistence is enabled
  const [filter, setFilter] = useState(() =>
    persistFilters ? getFilter(apiUrl) : {}
  );

  // Sync filter to context AFTER it changes (not during render)
  useEffect(() => {
    if (persistFilters) {
      setGridFilter(apiUrl, filter);
    }
  }, [filter, persistFilters, apiUrl, setGridFilter]);

  // Sync searchForm to context AFTER it changes (not during render)
  useEffect(() => {
    if (persistFilters && Object.keys(searchForm).length > 0) {
      setGridSearchForm(apiUrl, searchForm);
    }
  }, [searchForm, persistFilters, apiUrl, setGridSearchForm]);

  const sortOrder = reverse ? "DESC" : reverse === false ? "ASC" : "";

  const toArray = (h) => (Array.isArray(h) ? h : h ? Object.values(h) : []);

  const normalise = (response) => {
    const base = response?.data ? response.data : response;
    return {
      list: base?.list ?? base ?? [],
      // Only ever read table headers from the payload, never Axios HTTP headers.
      headers: base?.headers ?? response?.data?.headers ?? [],
      // Optional: server-provided searchForm (field definitions)
      searchForm: base?.searchForm ?? {},
      totalCount:
        base?.totalCount ??
        response?.totalCount ??
        response?.data?.totalCount ??
        0,
    };
  };

  const getList = async (num = numberOfRecords) => {
    const params = { filter, headers: filterHeader };

    try {
      setIsLoading(true);
      setNumberOfRecords(num);
      const res = await apiClient.post(
        `api/${apiUrl}?page=${pageIndex}&page_size=${num}&sort_key=${sortKey}&sort_order=${sortOrder}`,
        params,
      );
      const data = normalise(res);

      setList(data.list || []);
      setFilterHeader(toArray(data.headers));
      setTotalCount(data.totalCount || 0);

      // Initialise/expand searchForm but never shrink it
      setSearchForm((prev) => {
        const next = data.searchForm || {};
        const prevCount = Object.keys(prev).length;
        const nextCount = Object.keys(next).length;

        if (nextCount === 0) return prev; // ignore missing/empty
        if (nextCount >= prevCount) return next; // accept new/growing sets
        return prev; // prevent shrinking
      });

      if (refresh) setRefreshGrid?.(false);
      if (applyColumns) setApplyColumns(false);
    } catch (e) {
      console.error("Error fetching list:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, sortKey, reverse, filter, refresh, applyColumns]);

  useEffect(() => {
    setPageIndex(1);
  }, [filter, sortKey, reverse]);

  const exportList = async () => {
    const params = { filter, headers: filterHeader };
    try {
      setIsExporting(true);
      const res = await apiClient.post(`api/${apiUrl}?export=csv`, params);
      const fileUrl = res?.file || res?.data?.file;
      if (!fileUrl) return console.error("No export file URL returned.");
      const a = document.createElement("a");
      a.href = fileUrl;
      a.setAttribute("download", "export.csv");
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Error exporting list:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSort = (keyname) => {
    setSortKey(keyname);
    setReverse((r) => !r);
  };

  const pageSizes = useMemo(() => [20, 50, 100, 200, 500], []);

  return {
    totalCount,
    pageIndex,
    sortKey,
    reverse,
    list,
    filterHeader,
    searchForm, // <-- expose this
    isExporting,
    isLoading,
    numberOfRecords,
    filter,
    setPageIndex,
    setReverse,
    setSortKey,
    setFilter,
    setApplyColumns,
    setFilterHeader,
    setNumberOfRecords,
    handleSort,
    exportList,
    getList,
    pageSizes,
  };
}
