# 🧩 DynamicGrid Documentation

`DynamicGrid` is a **React-based data grid** built on **Radix UI** and **TailwindCSS**.
It provides **pagination**, **sorting**, **filtering**, and fully **frontend-defined dropdown actions** — all declaratively.

> **Note:** The legacy **Column Manager / column visibility control** has been **removed** (see _Breaking Changes_).

---

## ⚙️ Core Overview

The grid is composed of modular parts:

- **`Grid`** – Orchestrates data fetching, sorting, pagination, and rendering.
- **`Grid.Column`** – Declarative column cell rendering (value + full record).
- **`Grid.Action`** – Contextual dropdown actions (frontend-only).
- **`DataTable`** – Table engine for layout & sort UI.
- **`FilterMenu`** – Advanced filtering UI (popover).
- **`ActiveFilterChips`** – Displays active filters and now supports **click-to-edit**.

---

## 📦 Installation

This library is UI-headless + Radix/Tailwind friendly. Ensure peers are installed in your host app.

```bash
# bun / npm / pnpm — pick one
bun add @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-label
bun add tailwindcss clsx
# your axios (or compatible) client
bun add axios
# then install your grid package (adjust name if different in package.json)
bun add ynotsoft-dynamic-grid
```

**Peer assumptions**

- React 18+ (tested on React 19)
- TailwindCSS present and configured
- Radix UI primitives available (DropdownMenu, Popover, Label)
- An HTTP client (axios or compatible) if using `apiUrl + apiClient`

---

## 🚀 Quick Start

```jsx
import Grid from "@/lib/DynamicGrid/Grid.jsx";
import apiClient from "@/services/apiClient";

export default function UsersGrid() {
  return (
    <Grid apiUrl="admin/users" apiClient={apiClient} pageLength={20}>
      <Grid.Column name="email">{(value) => <span>{value}</span>}</Grid.Column>

      <Grid.Action>
        {(record, { getIcon, intentClasses, RightSlot }) => {
          const ViewIcon = getIcon?.("view");
          return (
            <>
              <DropdownMenu.Label className={intentClasses(undefined, "label")}>
                Quick actions
              </DropdownMenu.Label>
              <DropdownMenu.Separator
                className={intentClasses(undefined, "separator")}
              />

              <DropdownMenu.Item
                className={intentClasses("success")}
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/admin/users/${record.id}`);
                }}
              >
                {ViewIcon && (
                  <ViewIcon
                    className={intentClasses("success", "icon")}
                    aria-hidden
                  />
                )}
                <span>View</span>
                <RightSlot>⌘V</RightSlot>
              </DropdownMenu.Item>
            </>
          );
        }}
      </Grid.Action>
    </Grid>
  );
}
```

✅ **Automatic Features**

- Data loading via `apiUrl + apiClient`
- Sorting, pagination, and filter UI/logic
- Integrated Radix dropdown actions
- Context-aware theming via `intentClasses`
- **Actions column appears only when** `<Grid.Action>` exists

---

## ⚡ `Grid` Props

| Prop               | Type        | Required | Description                                          |
| ------------------ | ----------- | -------: | ---------------------------------------------------- |
| `apiUrl`           | `string`    |  **Yes** | API endpoint path for fetching data.                 |
| `apiClient`        | `object`    |  **Yes** | Axios instance or compatible HTTP client.            |
| `pageLength`       | `number`    |       No | Rows per page (default: `15`).                       |
| `refresh`          | `boolean`   |       No | Toggle to trigger a data refresh.                    |
| `setRefreshGrid`   | `function`  |       No | Setter for `refresh`.                                |
| `headerButtons`    | `ReactNode` |       No | Extra header actions (e.g., “Create”).               |
| `noRecordsMessage` | `string`    |       No | Message when no rows.                                |
| `showExportButton` | `boolean`   |       No | Show Export CSV button (default: `false`).           |
| `persistFilters`   | `boolean`   |       No | Persist filters across navigation (default: `true`). |

**Server-side contract** (expected query params):
Your `apiClient` should send `page`, `pageLength`, `sort` (e.g., `field:asc|desc`), and a serialised `filter` payload. Return JSON `{ data: any[], total: number }`.

---

## 📊 Defining Columns

```jsx
<Grid.Column name="UserName">
  {(value, record) => (
    <strong>
      {record.first_name} {record.last_name}
    </strong>
  )}
</Grid.Column>
```

**Renderer parameters**

- `value` — the field value of the column
- `record` — full row object

---

## 🎯 Custom Actions (`<Grid.Action>`)

Backend-driven actions are **removed**. Define actions client-side:

- If `<Grid.Action>` exists → **Actions column is rendered**.
- If not → **Actions column is omitted**.

### Example (Radix Dropdown)

```jsx
<Grid.Action>
  {(record, { getIcon, intentClasses, RightSlot }) => {
    const EditIcon = getIcon?.("edit");
    const TrashIcon = getIcon?.("delete");
    return (
      <>
        <DropdownMenu.Label className={intentClasses(undefined, "label")}>
          Quick actions
        </DropdownMenu.Label>
        <DropdownMenu.Separator
          className={intentClasses(undefined, "separator")}
        />

        <DropdownMenu.Item
          className={intentClasses("success")}
          onSelect={(e) => {
            e.preventDefault();
            openEditDialog(record);
          }}
        >
          {EditIcon && (
            <EditIcon
              className={intentClasses("success", "icon")}
              aria-hidden
            />
          )}
          <span>Edit</span>
          <RightSlot>⌘E</RightSlot>
        </DropdownMenu.Item>

        <DropdownMenu.Item
          className={intentClasses("danger")}
          onSelect={(e) => {
            e.preventDefault();
            handleDelete(record.primary_key, record.Question);
          }}
        >
          {TrashIcon && (
            <TrashIcon
              className={intentClasses("danger", "icon")}
              aria-hidden
            />
          )}
          <span>Delete</span>
          <RightSlot>⌘⌫</RightSlot>
        </DropdownMenu.Item>
      </>
    );
  }}
</Grid.Action>
```

---

## 🎨 Theming Utilities

**`intentClasses(intent?, part?)`**
Consistent Tailwind tone classes for menu parts.

| Param    | Values                                                         |
| -------- | -------------------------------------------------------------- |
| `intent` | `"success"`, `"danger"`, `"warning"`, `"default"` _(optional)_ |
| `part`   | `"item"`, `"icon"`, `"label"`, `"separator"`                   |

**`getIcon(key)`** → Returns a Radix icon from your `IconMap`.
**`RightSlot`** → Right-aligned hint (e.g., shortcut key).

---

## 🔣 Icon Mapping

Your internal `IconMap` connects action names → Radix icons (e.g., `view`, `edit`, `delete`, `copy`, `refresh`, etc.).
Import custom icons directly if you don’t want to use the map.

---

## 🔍 Filters & Search

DynamicGrid supports client-side filtering with a11y popover and **interactive chips**.

```jsx
<FilterMenu searchForm={list.searchForm} setFilter={setFilter} filter={filter} />
<ActiveFilterChips
  filter={filter}
  onRemove={removeFilter}
  onClear={() => setFilter({})}
/>
```

### Click-to-edit Chips (New)

- Click / Enter / Space on a chip → opens editor for that field.
- **Autofocus**: value input (text) or first checkbox (multi-select).
- **No backend calls**: filtering is client-side on the current dataset.

**Imperative API (FilterMenu)**

- `open()` – open the popover
- `close()` – close & reset internal editor state
- `openForField(key)` – open and jump straight to the field; autofocus value

**Integration sketch**

```jsx
const filterMenuRef = useRef(null);

<ActiveFilterChips
  filter={grid.filter}
  onRemove={removeFilter}
  onEdit={(key) => filterMenuRef.current?.openForField(key)}
/>

<GridHeader filterMenuRef={filterMenuRef} />
```

---

## 💾 Filter Persistence (Per-Grid)

When `persistFilters` is `true` (default):

- Each grid is keyed by `apiUrl`.
- Filters + field definitions (searchForm) are stored in `FilterContext`.
- Navigating away and back restores state for that grid.
- Persistence is session-scoped (clears on reload).
  To persist across sessions, adapt `FilterContext` to use `localStorage`.

**Programmatically clear filters**

```jsx
import { useFilter } from "@/context/FilterContext";
const { clearFilter } = useFilter();
clearFilter("admin/users");
```

---

## ⌨️ Accessibility & Keyboard Support

- Proper roles on menus & items (Radix primitives).
- Chip controls are keyboard-accessible (Enter/Space).
- Filter field list supports arrow navigation; `Enter` applies; `Esc` closes; `Ctrl/Cmd+Enter` applies from anywhere.
- Focus ring visible; popovers preserve focus on value where possible.

---

## 🧠 Imperative Hooks Summary

- `FilterMenu` via `ref`: `open()`, `close()`, `openForField(key)`
- `Grid` exposes controlled props for page/sort/filter if you need URL-driven state (advanced pattern).

---

## 🧪 Error / Empty / Loading States

- Empty state rendered when `data.length === 0` after a resolved request.
- Loading spinners/skeletons rendered while fetching.
- Error message area (pass a string or node through `error` if you extend `Grid`).

---

## 🛠 Troubleshooting

- **Menu closes while typing in search**
  Ensure the popover isn’t re-mounting on each keystroke. Keep the menu mounted and debounce (`250ms`) search input.

- **Input loses focus on every keypress**
  Avoid resetting entire `searchForm` or `filter` objects each render. Update field-level state immutably and memoise menu sections.

- **Table overflows page**
  Wrap the grid in a container with bounded height and `overflow-auto`; avoid letting the table dictate page height on large datasets.

- **Actions column missing**
  It only renders if `<Grid.Action>` is present.

---

## 🔄 Breaking Changes

- **Backend-defined actions** → **Removed.** Use `<Grid.Action>`.
- **`showActions` prop** → **Removed.** Grid auto-detects `<Grid.Action>`.
- **Column Manager / Visibility control** → **Removed.**
- **Inline quick buttons** → Removed in favour of consistent dropdown menus.
- **Theme injection** → Unified helpers now passed into `Grid.Action` (`intentClasses`, `getIcon`, `RightSlot`).

---

## 🗓 Change History

### 2025-10-16

- **ActiveFilterChips → click to edit** with keyboard support.
- **FilterMenu → `openForField(key)`** with autofocus on the value input / first checkbox.
- A11y improvements: arrow navigation, `Enter` apply, `Esc` close, `Ctrl/Cmd+Enter` global apply.
- Filtering remains **client-side**.

---

## 🧱 File Structure

```
DynamicGrid/
│
├── Grid.js                  # Core wrapper
├── components/
│   ├── DataTable.js         # Table body + header glue
│   ├── GridHeader.js        # Header + buttons + filters
│   ├── ActiveFilterChips.js # Active filters with click-to-edit
│   ├── FilterMenu.js        # Popover editor (imperative API)
│   ├── IconMap.js           # Icon registry for actions
│
├── context/
│   └── FilterContext.js     # Per-apiUrl persistence (session)
│
├── hooks/
│   ├── useGridData.js       # Fetch + normalise
│   └── useActionFunctions.js
│
└── utils/
    └── html_markup.js       # Safe markup helper
```

---

## 🧭 Roadmap (opinionated priorities)

1. **Column visibility** (bring back minimally, client-only)
2. **CSV export** with current filters/sort
3. URL-synced state (page/sort/filter) helper for deep-links
4. Batch row selection + toolbar actions
5. Virtualised rows (optional adapter) for very large lists
6. Column resize with min/max
7. Multi-sort (Shift+click headers) with badges in toolbar

---

## Licence

MIT © YNOT Software
