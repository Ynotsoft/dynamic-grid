// FilterMenu.jsx — Accessible Popover with chip → autofocus + operator/value restore
import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { Button, Flex } from "@radix-ui/themes";
import { Check, Filter as FilterIcon } from "lucide-react";

const TEXT_OPERATORS = ["contains", "equals", "starts with"];

// Helpers for legacy range strings and normalization
const parseLegacyRange = (str) => {
  if (!str || typeof str !== "string") return { from: "", to: "" };
  // support "YYYY-MM-DD - YYYY-MM-DD" OR "YYYY-MM-DD-YYYY-MM-DD"
  const parts = str.includes(" - ") ? str.split(" - ") : str.split("-");
  if (parts.length < 2) return { from: "", to: "" };
  const from = (parts[0] || "").trim();
  const to = (parts[1] || "").trim();
  return { from, to };
};

const normalizeStoredRange = (value) => {
  // Accept {from,to} object or legacy string
  if (value && typeof value === "object" && "from" in value && "to" in value) {
    return { from: value.from || "", to: value.to || "" };
  }
  if (typeof value === "string") return parseLegacyRange(value);
  return { from: "", to: "" };
};

const FilterMenu = forwardRef(function FilterMenu(
  { searchForm = {}, setFilter, filter },
  ref,
) {
  const fieldKeys = useMemo(() => Object.keys(searchForm), [searchForm]);

  // popover
  const [open, setOpen] = useState(false);

  // which field is being edited
  const [activeKey, setActiveKey] = useState(null);

  // editor scratch state (per active field)
  const [localOperator, setLocalOperator] = useState("contains");
  const [localValue, setLocalValue] = useState("");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  // date inputs
  const [localDateRange, setLocalDateRange] = useState({ from: "", to: "" });

  // focus refs
  const valueInputOrFirstOptionRef = useRef(null); // TextBox value / first checkbox / DateRange "From"
  const fieldListRef = useRef(null);

  // live region for SRs
  const [liveMsg, setLiveMsg] = useState("");

  // ---------- helpers ----------
  const resetLocal = useCallback(() => {
    setLocalOperator("contains");
    setLocalValue("");
    setSelectedCheckboxes([]);
    setLocalDateRange({ from: "", to: "" });
  }, []);

  // Pull existing rule (if any) and RESTORE operator/value/options
  const initEditorFor = useCallback(
    (key, { autofocusValue = false } = {}) => {
      setActiveKey(key || null);
      if (!key) return;

      const def = searchForm[key];
      if (!def) return;

      const existing = filter?.[key];
      const isText = def.field_type === "TextBox";
      const isGroup = def.field_type === "CheckBoxGroup";
      const isDateRange =
        def.field_type === "DateRange" || def.field_type === "RangePickerField"; // legacy support

      if (isDateRange) {
        const normalized = normalizeStoredRange(existing?.value);
        setLocalDateRange(normalized);
      }

      if (isText) {
        const nextOp = existing?.operator;
        const normalizedOp =
          typeof nextOp === "string" && TEXT_OPERATORS.includes(nextOp)
            ? nextOp
            : "contains";
        setLocalOperator(normalizedOp);
        setLocalValue(existing?.value ?? "");
      }

      if (isGroup) {
        const existingVals = Array.isArray(existing?.value)
          ? existing.value
          : existing?.value != null
            ? [existing.value]
            : [];
        setSelectedCheckboxes(existingVals.map((v) => String(v)));
      }

      // Focus after render
      if (autofocusValue) {
        setTimeout(() => valueInputOrFirstOptionRef.current?.focus(), 0);
      } else {
        setTimeout(() => fieldListRef.current?.focus(), 0);
      }
    },
    [searchForm, filter],
  );

  const closeAll = useCallback(() => {
    setOpen(false);
    setActiveKey(null);
    resetLocal();
  }, [resetLocal]);

  // expose imperative controls to parent (used by ActiveFilterChips)
  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
      close: () => closeAll(),
      openForField: (key) => {
        setOpen(true);
        // mount, set field, then focus the VALUE input/first option
        setTimeout(() => initEditorFor(key, { autofocusValue: true }), 0);
      },
    }),
    [closeAll, initEditorFor],
  );

  const toggleCheckbox = useCallback((value) => {
    const v = String(value);
    setSelectedCheckboxes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  }, []);

  const clearCheckboxes = () => setSelectedCheckboxes([]);
  const selectAll = (allValues = []) =>
    setSelectedCheckboxes(allValues.map((v) => String(v)));

  const applyCurrent = useCallback(() => {
    if (!activeKey) return;
    const def = searchForm[activeKey];
    if (!def) return;

    const isText = def.field_type === "TextBox";
    const isGroup = def.field_type === "CheckBoxGroup";
    const isDateRange =
      def.field_type === "DateRange" || def.field_type === "RangePickerField"; // legacy support

    // TextBox
    if (isText) {
      const value = String(localValue).trim();
      if (!value) {
        // remove rule if empty
        setFilter((prev) => {
          const next = { ...prev };
          delete next[activeKey];
          return next;
        });
        setLiveMsg(`Removed filter for ${def.title || activeKey}.`);
        closeAll();
        return;
      }
      const operator = TEXT_OPERATORS.includes(localOperator)
        ? localOperator
        : "contains";
      setFilter((prev) => ({
        ...prev,
        [activeKey]: {
          field_type: def.field_type,
          title: def.title,
          DBField: def.DBField,
          source: def.source,
          operator,
          value,
        },
      }));
      setLiveMsg(`Applied filter for ${def.title || activeKey}.`);
      closeAll();
      return;
    }

    // CheckBoxGroup
    if (isGroup) {
      if (selectedCheckboxes.length === 0) {
        setFilter((prev) => {
          const next = { ...prev };
          delete next[activeKey];
          return next;
        });
        setLiveMsg(`Removed filter for ${def.title || activeKey}.`);
        closeAll();
        return;
      }
      setFilter((prev) => ({
        ...prev,
        [activeKey]: {
          field_type: def.field_type,
          title: def.title,
          DBField: def.DBField,
          source: def.source,
          operator: "in",
          value: selectedCheckboxes,
        },
      }));
      setLiveMsg(`Applied filter for ${def.title || activeKey}.`);
      closeAll();
      return;
    }

    // DateRange / RangePickerField
    if (isDateRange) {
      let from = (localDateRange.from || "").trim();
      let to = (localDateRange.to || "").trim();

      // swap if reversed
      if (from && to && from > to) [from, to] = [to, from];

      // remove filter if either date missing
      if (!from || !to) {
        setFilter((prev) => {
          const next = { ...prev };
          delete next[activeKey];
          return next;
        });
        setLiveMsg(`Removed filter for ${def.title || activeKey}.`);
        closeAll();
        return;
      }

      setFilter((prev) => ({
        ...prev,
        [activeKey]: {
          field_type: def.field_type, // keep the incoming type
          title: def.title,
          DBField: def.DBField,
          source: def.source,
          operator: "between",
          // Store canonical object; your request layer can serialize to legacy string if needed
          value: { from, to },
        },
      }));
      setLiveMsg(`Applied filter for ${def.title || activeKey}.`);
      closeAll();
      return;
    }
  }, [
    activeKey,
    localOperator,
    localValue,
    searchForm,
    selectedCheckboxes,
    localDateRange,
    setFilter,
    closeAll,
  ]);

  const clearAll = useCallback(() => {
    setFilter({});
    setLiveMsg("All filters cleared.");
    setActiveKey(null);
    resetLocal();
    setTimeout(() => fieldListRef.current?.focus(), 0);
  }, [resetLocal, setFilter]);

  // ---------- keyboard handling ----------
  const onContentKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeAll();
    }
    if (e.key === "Enter") {
      const def = activeKey ? searchForm[activeKey] : null;
      // Checkbox groups: Enter should behave like clicking Apply
      if (def?.field_type === "CheckBoxGroup") {
        e.preventDefault();
        applyCurrent();
        return;
      }
      // Date ranges: Enter should also apply
      if (
        def?.field_type === "DateRange" ||
        def?.field_type === "RangePickerField"
      ) {
        e.preventDefault();
        applyCurrent();
        return;
      }
      // Keep Ctrl/Cmd+Enter fallback for anywhere
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        applyCurrent();
      }
    }
  };

  const onFieldListKeyDown = (e) => {
    if (!fieldKeys.length) return;

    const currentIndex = activeKey ? fieldKeys.indexOf(activeKey) : -1;
    const move = (idx) => {
      const clamped = Math.max(0, Math.min(fieldKeys.length - 1, idx));
      const nextKey = fieldKeys[clamped];
      // when navigating from the list, keep list focus first (not value)
      initEditorFor(nextKey, { autofocusValue: false });
    };

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(currentIndex < 0 ? 0 : currentIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(currentIndex <= 0 ? 0 : currentIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(fieldKeys.length - 1);
        break;
      default:
        break;
    }
  };

  // manage initial focus when opening from the Filter button (no target field)
  useEffect(() => {
    if (!open) return;
    if (!activeKey) {
      setTimeout(() => fieldListRef.current?.focus(), 0);
    }
  }, [open, activeKey]);

  // ---------- ids for aria wiring ----------
  const popoverLabelId = "filtermenu-label";
  const popoverDescId = "filtermenu-desc";
  const fieldListId = "filtermenu-fields";
  const editorRegionId = "filtermenu-editor";
  const ruleCountId = "filtermenu-rules";

  // ---------- render ----------
  return (
    <Flex direction="row" align="center" gap="2">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          asChild
          aria-haspopup="dialog"
          aria-controls="filtermenu-popover"
        >
          <Button variant="outline" onClick={() => setOpen((v) => !v)}>
            <FilterIcon width={18} height={18} aria-hidden="true" />
            &nbsp;Filter
          </Button>
        </Popover.Trigger>

        <Popover.Content
          id="filtermenu-popover"
          sideOffset={8}
          align="start"
          className="rounded-lg border border-gray-200 bg-white p-2 shadow-lg min-w-[420px] z-50"
          aria-labelledby={popoverLabelId}
          aria-describedby={popoverDescId}
          role="dialog"
          onKeyDown={onContentKeyDown}
        >
          <div className="sr-only" id={popoverLabelId}>
            Table filters
          </div>
          <div className="sr-only" id={popoverDescId}>
            Use Arrow keys to move through fields, Tab to move into the editor.
            Press Enter to apply.
          </div>

          <div className="flex gap-3">
            {/* Field list */}
            <div className="w-48">
              <div
                id={fieldListId}
                role="listbox"
                aria-label="Filter fields"
                aria-describedby={ruleCountId}
                aria-activedescendant={
                  activeKey ? `field-${activeKey}` : undefined
                }
                tabIndex={0}
                ref={fieldListRef}
                className="rounded-md border border-gray-200 outline-none focus:ring-gray-300"
                onKeyDown={onFieldListKeyDown}
              >
                {fieldKeys.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No fields available
                  </div>
                ) : (
                  fieldKeys.map((key) => {
                    const def = searchForm[key];
                    const selected = key === activeKey;
                    return (
                      <button
                        key={key}
                        id={`field-${key}`}
                        role="option"
                        aria-selected={selected}
                        type="button"
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 ${
                          selected ? "bg-gray-50" : ""
                        }`}
                        onClick={() =>
                          initEditorFor(key, { autofocusValue: false })
                        }
                      >
                        <span className="truncate">{def.title || key}</span>
                        {selected ? (
                          <Check size={16} aria-hidden="true" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                <span id={ruleCountId} className="text-xs text-gray-500">
                  Active rules: {Object.keys(filter || {}).length}
                </span>
                <Button
                  variant="soft"
                  onClick={clearAll}
                  aria-label="Clear all filters"
                >
                  Clear all
                </Button>
              </div>
            </div>

            {/* Editor panel */}
            <div
              id={editorRegionId}
              role="group"
              aria-label="Filter editor"
              className="flex-1 rounded-md border border-gray-200 p-3"
            >
              {!activeKey ? (
                <div className="text-sm text-gray-500">
                  Select a field to edit its filter.
                </div>
              ) : (
                (() => {
                  const def = searchForm[activeKey] || {};
                  const isText = def.field_type === "TextBox";
                  const isGroup = def.field_type === "CheckBoxGroup";
                  const isDateRange =
                    def.field_type === "DateRange" ||
                    def.field_type === "RangePickerField"; // legacy support
                  const helpId = `help-${activeKey}`;

                  if (isText) {
                    return (
                      <div className="flex flex-col gap-2">
                        <div
                          className="text-xs font-medium text-gray-600"
                          id={`label-${activeKey}`}
                        >
                          {def.title || activeKey}
                        </div>

                        <label
                          className="text-xs text-gray-600"
                          htmlFor={`op-${activeKey}`}
                        >
                          Operator
                        </label>
                        <select
                          id={`op-${activeKey}`}
                          value={localOperator}
                          onChange={(e) => setLocalOperator(e.target.value)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-400"
                          aria-describedby={helpId}
                        >
                          {TEXT_OPERATORS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>

                        <label
                          className="text-xs text-gray-600"
                          htmlFor={`val-${activeKey}`}
                        >
                          Value
                        </label>
                        <input
                          id={`val-${activeKey}`}
                          ref={valueInputOrFirstOptionRef}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-400"
                          placeholder="Enter value…"
                          value={localValue}
                          onChange={(e) => setLocalValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              applyCurrent();
                            }
                          }}
                          aria-describedby={helpId}
                        />

                        <div id={helpId} className="sr-only">
                          Choose an operator and enter a value. Press Enter to
                          apply.
                        </div>

                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="soft"
                            onClick={() => {
                              // Reset to defaults, not the chip’s values
                              setLocalOperator("contains");
                              setLocalValue("");
                            }}
                          >
                            Reset
                          </Button>
                          <Button onClick={applyCurrent}>Apply</Button>
                        </div>
                      </div>
                    );
                  }

                  if (isGroup) {
                    // 1) Normalise: allow source to be an Array *or* an Object map
                    const src = def.source;
                    const options = Array.isArray(src)
                      ? src.map((v) => ({
                          key: String(v),
                          label: String(v),
                          value: String(v),
                        }))
                      : src && typeof src === "object"
                        ? Object.entries(src).map(([k, label]) => ({
                            key: String(k),
                            label: String(label),
                            value: String(k), // store the key as value in the filter
                          }))
                        : [];

                    return (
                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-medium text-gray-600">
                          {def.title || activeKey}
                        </div>

                        <fieldset
                          aria-describedby={`help-${activeKey}`}
                          className="rounded-md border border-gray-200 p-2 max-h-56 overflow-auto"
                          role="group"
                        >
                          <legend className="sr-only">
                            Select one or more
                          </legend>

                          {options.length === 0 ? (
                            <div className="px-1 py-1 text-sm text-gray-500">
                              No options
                            </div>
                          ) : (
                            options.map((opt, idx) => {
                              const inputId = `chk-${activeKey}-${idx}`;
                              const checked = selectedCheckboxes.includes(
                                opt.value,
                              );

                              return (
                                <div
                                  key={opt.key}
                                  className="flex items-center mb-2"
                                >
                                  <input
                                    id={inputId}
                                    type="checkbox"
                                    value={opt.value}
                                    checked={checked}
                                    onChange={(e) =>
                                      toggleCheckbox(e.target.value)
                                    }
                                    className="h-4 w-4 border-gray-300 rounded"
                                    ref={
                                      idx === 0
                                        ? valueInputOrFirstOptionRef
                                        : null
                                    }
                                  />
                                  <label
                                    htmlFor={inputId}
                                    className="ml-2 text-sm text-gray-700"
                                  >
                                    {opt.label}
                                  </label>
                                </div>
                              );
                            })
                          )}
                        </fieldset>
                        <div id={`help-${activeKey}`} className="sr-only">
                          Use Tab to move between options. Space toggles a
                          checkbox. Press Apply to confirm selections.
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="soft"
                            onClick={() => {
                              const allValues = options.map((o) => o.value);
                              const allSelected =
                                allValues.length > 0 &&
                                allValues.every((v) =>
                                  selectedCheckboxes.includes(v),
                                );

                              if (allSelected) {
                                // all selected → clear them
                                clearCheckboxes();
                              } else {
                                // not all selected → select all
                                selectAll(allValues);
                              }
                            }}
                          >
                            {options.length > 0 &&
                            options.every((o) =>
                              selectedCheckboxes.includes(o.value),
                            )
                              ? "Clear all"
                              : "Select all"}
                          </Button>
                          <Button onClick={applyCurrent}>Apply</Button>
                        </div>
                      </div>
                    );
                  }

                  if (isDateRange) {
                    return (
                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-medium text-gray-600">
                          {def.title || activeKey}
                        </div>

                        <label
                          className="text-xs text-gray-600"
                          htmlFor={`from-${activeKey}`}
                        >
                          From
                        </label>
                        <input
                          id={`from-${activeKey}`}
                          type="date"
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-400"
                          value={localDateRange.from}
                          onChange={(e) =>
                            setLocalDateRange((prev) => ({
                              ...prev,
                              from: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applyCurrent();
                            }
                          }}
                          ref={valueInputOrFirstOptionRef} // autofocus target for DateRange
                        />

                        <label
                          className="text-xs text-gray-600"
                          htmlFor={`to-${activeKey}`}
                        >
                          To
                        </label>
                        <input
                          id={`to-${activeKey}`}
                          type="date"
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-400"
                          value={localDateRange.to}
                          onChange={(e) =>
                            setLocalDateRange((prev) => ({
                              ...prev,
                              to: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              applyCurrent();
                            }
                          }}
                        />

                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="soft"
                            onClick={() =>
                              setLocalDateRange({ from: "", to: "" })
                            }
                          >
                            Clear
                          </Button>
                          <Button onClick={applyCurrent}>Apply</Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="text-sm text-amber-700">
                      Unsupported field type:{" "}
                      {String(def.field_type || "unknown")}
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {liveMsg}
          </div>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
});

export default FilterMenu;
