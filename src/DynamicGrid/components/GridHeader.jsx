import FilterMenu from "./FilterMenu.jsx";
import { Button, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, DownloadIcon } from "@radix-ui/react-icons";

export default function GridHeader({
  isLoading,
  searchForm,
  list,
  filter,
  setFilter,
  isExporting,
  onExport,
  rightSlot,
  exportButton,
  showExportButton = false,
  // NEW: pass an imperative ref down to FilterMenu
  filterMenuRef,
}) {
  const rightItems = (
    Array.isArray(rightSlot) ? rightSlot : [rightSlot]
  ).filter(Boolean);

  return (
    <div className="flex justify-between w-full">
      <div className="flex gap-x-2 items-center w-full">
        {!isLoading && (
          <div className="w-full flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <FilterMenu
                ref={filterMenuRef}
                searchForm={searchForm}
                setFilter={setFilter}
                filter={filter}
              />
            </div>

            <div className="flex items-center gap-4">
              {exportButton ? exportButton : null}
              {showExportButton && !exportButton && (
                <Button
                  onClick={onExport}
                  disabled={isExporting}
                  variant="soft"
                  className="cursor-pointer"
                >
                  <DownloadIcon />
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
              )}
              {rightItems.map((node, i) => (
                <span key={`right-${i}`} className="inline-flex gap-4 ">
                  {node}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
