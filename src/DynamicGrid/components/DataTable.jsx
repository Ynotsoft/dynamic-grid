import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { IconButton, Table } from "@radix-ui/themes";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import TableSkeleton from "./TableSkeleton.jsx";

export default function DataTable({
  isLoading,
  pageLength,
  filterHeader,
  sortKey,
  reverse,
  onSort,
  list,
  renderCell,
  actionRenderer, // optional: if omitted, fallback default actions are used
  noRecordsMessage,
}) {

  // ---------- Auto-detect actions presence (column shows only when needed) ----------
  const records = list?.records || [];
  const showActionsColumn = Boolean(actionRenderer);

  return (
    <div className="overflow-x-auto z-10">
      {/* <table className="mx-auto w-full max-w-full divide-y divide-gray-200 bg-white"> */}
      <Table.Root variant="ghost" layout="auto">
        {isLoading ? (
          <TableSkeleton rows={1} columns={4} />
        ) : (
          <Table.Header>
            <Table.Row align="top">
              {filterHeader?.map(
                (header) =>
                  header.display && (
                    <Table.ColumnHeaderCell
                      key={header.sort_key || header.title}
                      onClick={
                        header.sort_key
                          ? () => onSort(header.sort_key)
                          : undefined
                      }
                      className={`text-sm font-normal capitalize  ${header.sort_key ? "cursor-pointer" : ""
                        }`}
                    >
                      {header.title}
                      {header.sort_key && header.sort_key === sortKey && (
                        <span className="ml-2 text-gray-500">
                          {reverse ? "▼" : "▲"}
                        </span>
                      )}
                    </Table.ColumnHeaderCell>
                  ),
              )}

              {showActionsColumn && (
                <Table.ColumnHeaderCell className="sticky w-10 shrink px-2 py-4 text-left text-sm font-semibold uppercase text-gray-700" >
                  Actions
                </Table.ColumnHeaderCell>
              )}
            </Table.Row>
          </Table.Header>
        )}

        {isLoading ? (
          <TableSkeleton rows={pageLength} columns={4} />
        ) : (
          <Table.Body>
            {records.length ? (
              records.map((record, index) => {
                const actionCount = Object.keys(record.actions || {}).length;
                const rowHasApiActions = actionCount > 0;

                // Show a menu if a custom renderer exists OR row has API actions
                const shouldShowMenu =
                  Boolean(actionRenderer) || rowHasApiActions;

                return (
                  <Table.Row key={index} className="hover:bg-gray-100 transition-colors">
                    {list.columns?.map((col, colIndex) =>
                        <Table.Cell
                          key={`${index}-${colIndex}`}
                          className="whitespace  max-w-sm truncate  text-sm text-black"
                        >                      
                          {renderCell(record, col)}
                        </Table.Cell>                    
                    )}

                    {showActionsColumn && shouldShowMenu && (
                      <Table.Cell className="min-w-8 shrink-0 px-2 py-3.5 align-middle text-sm text-gray-600 ">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <IconButton
                              size="1"
                              variant="soft"
                              color="gray"
                              aria-label="Open actions"
                              className="mx-auto grid h-8 w-8 place-items-center bg-transparent  hover:bg-gray-200"
                            >
                              <DotsVerticalIcon color="gray" />
                            </IconButton>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              sideOffset={6}
                              align="end"
                              className="z-[60] min-w-28 w-fit rounded-md border border-gray-200 bg-white p-1 shadow-lg focus:outline-none"
                            >
                              {actionRenderer(record) }
                              <DropdownMenu.Arrow className="fill-white" />
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    )}
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={
                    (list.columns ? list.columns.length : 1) +
                    (list.enableCheckbox ? 1 : 0) +
                    (showActionsColumn ? 1 : 0)
                  }
                  className="whitespace px-6 py-4 text-center text-sm text-black"
                >
                  {noRecordsMessage || "No records found"}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        )}
      </Table.Root>
    </div>
  );
}
