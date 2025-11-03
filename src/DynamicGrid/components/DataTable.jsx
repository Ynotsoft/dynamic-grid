import { cloneElement } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { IconButton, Table } from "@radix-ui/themes";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import TableSkeleton from "./TableSkeleton.jsx";
import { getActionIcon } from "./IconMap.jsx";

// Safe hook to use navigation only when router is available
function useSafeNavigate() {
  try {
    // Only import useNavigate if react-router is available
    const { useNavigate } = require("react-router");
    return useNavigate();
  } catch {
    // Return a no-op function if react-router is not available
    return () => {};
  }
}

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
  const navigate = useSafeNavigate();

  // ---------- Theme (scoped to Grid/DataTable) ----------
  function intentClasses(intent, part = "item") {
    const tone = (intent || "").toLowerCase();

    const base = {
      item: [
        "group flex select-none items-center gap-2 rounded px-2 py-1.5 text-sm outline-none",
        "text-gray-700",
        "data-[disabled]:text-gray-300 data-[disabled]:pointer-events-none",
        // turn all text (and thus icons using currentColor) white on hover/highlight
        "group-hover:text-white data-[highlighted]:text-white transition-colors",
      ].join(" "),

      icon: [
        "h-4 w-4 shrink-0",
        // ensure icon uses currentColor and transitions like text
        "text-current",
        "opacity-80 group-data-[highlighted]:opacity-100",
        // force white on hover/highlight even if an icon lib doesn’t inherit perfectly
        "group-hover:text-white data-[highlighted]:text-white",
        "transition-colors",
      ].join(" "),

      label: "px-2 py-1.5 text-xs font-medium text-gray-500",
      separator: "my-1 h-px bg-gray-200",
    };

    const toneMap = {
      danger: "text-red-600 hover:bg-red-600 data-[highlighted]:bg-red-600",
      success:
        "text-green-600 hover:bg-green-600 data-[highlighted]:bg-green-600",
      warning:
        "text-amber-600 hover:bg-amber-500 data-[highlighted]:bg-amber-500",
      warn: "text-amber-600 hover:bg-amber-500 data-[highlighted]:bg-amber-500",
      default: "hover:bg-primary data-[highlighted]:bg-primary",
    };

    const accent = toneMap[tone] || toneMap.default;

    if (part === "icon") return base.icon;
    if (part === "label") return base.label;
    if (part === "separator") return base.separator;
    return `${base.item} ${accent}`; // item
  }

  const RightSlot = ({ children }) => (
    <span className="ml-auto pl-6 text-xs tabular-nums opacity-70">
      {children}
    </span>
  );

  const theme = {
    RightSlot,
    getIcon: getActionIcon,
    intentClasses,
  };

  // ---------- Auto-detect actions presence (column shows only when needed) ----------
  const records = list?.records || [];

  const showActionsColumn = Boolean(actionRenderer);

  // ---------- Built-in fallback when no custom actionRenderer is provided ----------
  function DefaultActionRenderer(
    record,
    { RightSlot, getIcon, intentClasses },
  ) {
    const entries = Object.entries(record.actions || {});
    if (entries.length === 0) return null;

    return (
      <>
        <DropdownMenu.Label className={intentClasses(undefined, "label")}>
          Quick actions
        </DropdownMenu.Label>
        <DropdownMenu.Separator className={intentClasses("", "separator")} />

        {entries.map(([key, action]) => {
          const Icon = getIcon?.(action.icon);
          return (
            <DropdownMenu.Item
              key={key}
              disabled={!!action.disabled}
              className={`group flex select-none items-center gap-2 rounded px-2 py-1.5 text-sm outline-none text-gray-700 hover:bg-gray-200 data-[disabled]:bg-gray-50  data-[disabled]:pointer-events-none`}
              onSelect={(e) => {
                e.preventDefault();
                if (typeof window[action.func_name] === "function") {
                  window[action.func_name]({ id: action.id, action, record });
                } else if (action.type === "link" && action.url) {
                  navigate(action.url);
                }
              }}
            >
              {Icon && <Icon className={`text-gray-900`} aria-hidden />}
              <span>{action.title}</span>
              {action.shortcut && <RightSlot>{action.shortcut}</RightSlot>}
            </DropdownMenu.Item>
          );
        })}
      </>
    );
  }

  return (
    <div className="overflow-x-auto z-10">
      {/* <table className="mx-auto w-full max-w-full divide-y divide-gray-200 bg-white"> */}
      <Table.Root variant="ghost" layout="auto">
        {isLoading ? (
          <TableSkeleton rows={1} columns={4} />
        ) : (
          <Table.Header>
            <Table.Row align="center">
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
                <Table.ColumnHeaderCell className="sticky w-10 shrink px-2 py-4 text-left text-sm font-semibold uppercase text-gray-700" />
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
                      col !== "actions" ? (
                        <Table.Cell
                          key={`${index}-${colIndex}`}
                          className="whitespace  max-w-sm truncate  text-sm text-black"
                        >
                          {" "}
                          {renderCell(record, col)}
                        </Table.Cell>
                      ) : null,
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
                              {actionRenderer
                                ? typeof actionRenderer === "function"
                                  ? actionRenderer(record, theme) // inject theme helpers
                                  : cloneElement(actionRenderer, {
                                    record,
                                    actionMenuTheme: theme,
                                  })
                                : DefaultActionRenderer(record, theme)}
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
