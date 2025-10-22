import { useMemo } from "react";
import {
  Flex,
  Badge,
  IconButton,
  Button,
  Tooltip,
  ScrollArea,
} from "@radix-ui/themes";
import { X, Filter } from "lucide-react";

/**
 * filter shape:
 * {
 *   name:   { title: "Name",   field_type: "TextBox",       operator: "contains", value: "ian" },
 *   status: { title: "Status", field_type: "CheckBoxGroup", operator: "in",       value: ["Approved","Pending"] },
 *   date:   { title: "Date",   field_type: "DateRange",     operator: "between",  value: { from:"2025-10-01", to:"2025-10-16" } }
 * }
 *
 * Props:
 * - onRemove(key)  : remove a single chip
 * - onClear?.()    : clear all chips (optional)
 * - onEdit?.(key)  : open the FilterMenu with this field active
 */

// --- helpers ----------------------------------------------------

const parseLegacyRange = (str) => {
  if (!str || typeof str !== "string") return { from: "", to: "" };
  // supports "YYYY-MM-DD – YYYY-MM-DD" or "YYYY-MM-DD - YYYY-MM-DD" or "YYYY-MM-DD,YYYY-MM-DD"
  const cleaned = str.replace("–", "-");
  const parts = cleaned.includes(" - ")
    ? cleaned.split(" - ")
    : cleaned.includes(",")
      ? cleaned.split(",")
      : cleaned.split("-");
  if (parts.length < 2) return { from: "", to: "" };
  return { from: (parts[0] || "").trim(), to: (parts[1] || "").trim() };
};

const normalizeRange = (val) => {
  if (val && typeof val === "object" && "from" in val && "to" in val) {
    return { from: val.from || "", to: val.to || "" };
  }
  if (typeof val === "string") return parseLegacyRange(val);
  return { from: "", to: "" };
};

const formatChipValue = (chip) => {
  const { field_type, value } = chip || {};

  if (field_type === "CheckBoxGroup") {
    if (Array.isArray(value)) return value.join(", ");
    return value ? String(value) : "";
  }

  if (field_type === "DateRange" || field_type === "RangePickerField") {
    const { from, to } = normalizeRange(value);
    if (from && to) return `${from} – ${to}`;
    return "";
  }

  // TextBox or anything else
  if (value == null) return "";
  return String(value);
};

const opColor = (chip = {}) => {
  const op = (chip.operator || "").toLowerCase();

  // when value is an object (date range), build a searchable string
  const valStr =
    chip.value && typeof chip.value === "object"
      ? `${chip.value.from ?? ""} ${chip.value.to ?? ""}`.toLowerCase()
      : String(chip.value ?? "").toLowerCase();

  // Status-like overrides (friendly defaults, only if looks like a status field)
  const title = (chip.title || "").toLowerCase();
  const looksLikeStatus =
    title.includes("status") ||
    title.includes("state") ||
    title.includes("result");
  if (looksLikeStatus) {
    if (
      valStr.includes("approved") ||
      valStr.includes("active") ||
      valStr.includes("success")
    )
      return "jade"; // green
    if (
      valStr.includes("pending") ||
      valStr.includes("progress") ||
      valStr.includes("review")
    )
      return "amber"; // yellow
    if (
      valStr.includes("rejected") ||
      valStr.includes("denied") ||
      valStr.includes("error")
    )
      return "ruby"; // red
  }

  // Operator-based colours
  if (op.includes("between")) return "orange";
  if (op.includes("contains") || op.includes("in")) return "indigo";
  if (op.includes("equals") || op === "=") return "jade";
  if (op.includes("not") || op === "!=") return "ruby";
  if (op.includes(">") || op.includes("<")) return "orange";

  return "gray";
};

// --- component --------------------------------------------------

export default function ActiveFilterChips({
  filter = {},
  onRemove,
  onClear,
  onEdit,
}) {
  const chips = useMemo(
    () =>
      Object.entries(filter)
        .filter(([_, c]) => c && c.operator && c.value !== undefined)
        .map(([key, c]) => ({ key, ...c })),
    [filter],
  );

  if (chips.length === 0) return null;

  return (
    <Flex align="center" justify="between" gap="2" className="w-full my-3">
      <ScrollArea type="auto" scrollbars="horizontal" style={{ width: "100%" }}>
        <Flex wrap="wrap" gap="2">
          {chips.map((chip) => {
            const color = opColor(chip);
            const valueLabel = formatChipValue(chip);
            const titleAttr = `${chip.title ?? chip.key} ${chip.operator ?? ""}${
              valueLabel ? " " + valueLabel : ""
            }`;

            return (
              <Badge
                key={chip.key}
                variant="soft"
                color={color}
                radius="1"
                size="2"
                className="pl-3 pr-1 py-1 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => onEdit?.(chip.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onEdit?.(chip.key);
                  }
                }}
                aria-label={`Edit ${chip.title || chip.key} filter`}
                title={titleAttr}
              >
                <Flex align="center" gap="2">
                  <span className="opacity-70">{chip.title || chip.key}</span>
                  <span className="opacity-60">{chip.operator}</span>
                  <span
                    title={valueLabel}
                    style={{
                      maxWidth: 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {valueLabel}
                  </span>

                  <Tooltip content="Remove filter">
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      radius="full"
                      aria-label={`Remove ${chip.title || chip.key} filter`}
                      onClick={(e) => {
                        e.stopPropagation(); // don't trigger edit
                        onRemove?.(chip.key);
                      }}
                      style={{ marginLeft: 2 }}
                    >
                      <X size={14} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Badge>
            );
          })}
        </Flex>
      </ScrollArea>

      {typeof onClear === "function" && (
        <Tooltip content="Clear all filters">
          <Button variant="soft" color="gray" size="2" onClick={onClear}>
            <Filter size={16} style={{ marginRight: 6 }} />
            Clear all
          </Button>
        </Tooltip>
      )}
    </Flex>
  );
}
