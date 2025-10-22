# 🧩 DynamicGrid Documentation

The `DynamicGrid` is a **React-based data grid system** built on Radix UI and TailwindCSS.
It provides pagination, sorting, filtering, column visibility control, and now fully **frontend-defined dropdown actions** — all declaratively.

---

## ⚙️ Core Overview

The grid is composed of modular parts:

- **`Grid`** – Orchestrates data fetching, sorting, pagination, and rendering.
- **`Grid.Column`** – Defines how each column’s cell is rendered.
- **`Grid.Action`** – Defines contextual dropdown actions or menus (frontend-only).
- **`DataTable`** – The table engine that powers sorting, display, and layout.
- **`FilterMenu`** – Adds advanced filtering options.

---

## 🚀 Basic Usage

```jsx
import Grid from "@/lib/DynamicGrid/Grid.jsx";
import apiClient from "@/services/apiClient"; // Your axios instance

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
</Grid>;
```

✅ **Automatic Features**

- Data loading via `apiUrl`
- Sorting, pagination, and column control
- Integrated Radix UI dropdowns
- Context-aware theming (`intentClasses`)
- The Actions column only appears when `<Grid.Action>` is defined

---

## ⚡ Props (Grid Component)

| Prop               | Type        | Required | Description                           |
| ------------------ | ----------- | -------- | ------------------------------------- |
| `apiUrl`           | `string`    | **Yes**  | API endpoint for fetching data        |
| `apiClient`        | `object`    | **Yes**  | Axios instance or API client for HTTP requests |
| `pageLength`       | `number`    | No       | Rows per page (default: `15`)         |
| `refresh`          | `boolean`   | No       | Trigger grid refresh                  |
| `setRefreshGrid`   | `function`  | No       | Setter for refresh state              |
| `headerButtons`    | `ReactNode` | No       | Extra buttons displayed in the header |
| `noRecordsMessage` | `string`    | No       | Message when no results are found     |
| `showExportButton` | `boolean`   | No       | Show export CSV button (default: `false`) |
| `persistFilters`   | `boolean`   | No       | Persist filters across page navigation (default: `true`) |

---

## 📊 Defining Columns

Columns are declared using `<Grid.Column>` and receive both the raw value and the full record.

```jsx
<Grid.Column name="UserName">
  {(value, record) => (
    <strong>
      {record.first_name} {record.last_name}
    </strong>
  )}
</Grid.Column>
```

**Parameters:**

- `value` → cell value
- `record` → entire row object

---

## 🎯 Custom Actions (`Grid.Action`)

The grid no longer supports **API-defined actions**.
You must define them yourself via `<Grid.Action>`.

The grid automatically detects whether a `<Grid.Action>` exists:

- ✅ If defined, the **Actions column** is rendered.
- 🚫 If not, the column is omitted entirely.

---

### ⚙️ How It Works

- The `showActions` prop has been **removed**.
- Backend-driven actions (e.g., `record.actions`) are **ignored**.
- All menu items, icons, and interactions are now handled **entirely client-side**.

---

### 🧱 Default Dropdown Menu Example

This example uses Radix UI’s dropdown system and integrates with the internal grid theme.

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

        {/* Edit */}
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

        {/* Delete */}
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

💡 **Key Notes:**

- `intentClasses("success")` and `intentClasses("danger")` handle hover and highlight tones.
- `RightSlot` right-aligns hint text or shortcut keys.
- `getIcon()` retrieves icons from the internal Radix IconMap.

---

### 🎨 Fully Custom Menu (Overriding Style)

You can override all theme styling and define your own dropdown layout entirely:

```jsx
<Grid.Action>
  {(record) => (
    <div className="flex flex-col p-2">
      <button
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-indigo-700 hover:bg-indigo-600 hover:text-white"
        onClick={() => viewDetails(record)}
      >
        <EyeOpenIcon className="h-4 w-4" />
        View Details
      </button>

      <button
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-red-600 hover:bg-red-600 hover:text-white"
        onClick={() => deleteRecord(record.id)}
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    </div>
  )}
</Grid.Action>
```

---

## 🧠 Theming Utilities

### `intentClasses(intent, part)`

Dynamic helper for consistent intent-based styling.

| Parameter | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `intent`  | `"success"`, `"danger"`, `"warning"`, `"default"` (optional) |
| `part`    | `"item"`, `"icon"`, `"label"`, `"separator"`                 |

#### Example:

```jsx
<DropdownMenu.Item className={intentClasses("danger")}>
  <TrashIcon className={intentClasses("danger", "icon")} />
  <span>Delete</span>
</DropdownMenu.Item>
```

Calling `intentClasses()` with **no args** defaults to neutral styling.

---

## 🧩 The `theme` Object (Injected into `<Grid.Action>`)

When you define a custom `<Grid.Action>`, your callback receives a `theme` helper:

| Property        | Type        | Description                                |
| --------------- | ----------- | ------------------------------------------ |
| `intentClasses` | `function`  | Applies consistent tone-based styles       |
| `getIcon`       | `function`  | Fetches a Radix UI icon from the `IconMap` |
| `RightSlot`     | `component` | Renders aligned hint text                  |

---

## 🔣 Icon Mapping

The internal `IconMap` connects common action names to Radix UI icons.
You can extend or modify this in `IconMap.js`.

| Key        | Icon                  | 💡 Use            |
| ---------- | --------------------- | ----------------- |
| `edit`     | `Pencil1Icon`         | ✏️ Edit or modify |
| `view`     | `EyeOpenIcon`         | 👁️ View details   |
| `delete`   | `TrashIcon`           | 🗑️ Delete item    |
| `menu`     | `DotsHorizontalIcon`  | ⋯ More options    |
| `settings` | `GearIcon`            | ⚙️ Settings       |
| `user`     | `PersonIcon`          | 👤 User info      |
| `download` | `DownloadIcon`        | ⬇️ Download       |
| `upload`   | `UploadIcon`          | ⬆️ Upload         |
| `copy`     | `CopyIcon`            | 📋 Copy data      |
| `refresh`  | `ReloadIcon`          | 🔄 Refresh data   |
| `lock`     | `LockClosedIcon`      | 🔒 Lock item      |
| `unlock`   | `LockOpen1Icon`       | 🔓 Unlock item    |
| `approve`  | `CheckIcon`           | ✅ Approve        |
| `reject`   | `Cross2Icon`          | ❌ Reject         |
| `search`   | `MagnifyingGlassIcon` | 🔍 Search         |

🧠 **How it works:**

```jsx
<Grid.Action>
  {(record, { getIcon }) => {
    const EditIcon = getIcon?.("edit");
    const ViewIcon = getIcon?.("view");

    return (
      <>
        {EditIcon && <EditIcon className="h-4 w-4 text-green-600" />}
        {ViewIcon && <ViewIcon className="h-4 w-4 text-blue-600" />}
      </>
    );
  }}
</Grid.Action>
```

To define a local icon, just import and call it directly —
`getIcon()` is purely for mapped shorthand keys.

---

## 🧩 Theme Object (Injected into Custom Actions)

Every `Grid.Action` automatically receives a `theme` object:

| Property        | Type        | Description                                   |
| --------------- | ----------- | --------------------------------------------- |
| `intentClasses` | `function`  | Style generator for dropdown tones            |
| `getIcon`       | `function`  | Fetches icons from the internal IconMap       |
| `RightSlot`     | `ReactNode` | Right-aligned hint (e.g., keyboard shortcuts) |

Example:

```jsx
const { getIcon, intentClasses, RightSlot } = theme;
```

---

## 🔍 Filters and Search

DynamicGrid supports client-side filtering with an accessible popover filter menu and interactive chips.

```jsx
<FilterMenu searchForm={list.searchForm} setFilter={setFilter} filter={filter} />
<ActiveFilterChips filter={filter} onRemove={removeFilter} onClear={() => setFilter({})} />
```

---

## Filter editing via ActiveFilterChips

**New, streamlined editing flow**: users can now click an active filter chip to edit that filter directly.

### What’s new

- **Click-to-edit chips**: `ActiveFilterChips` makes each chip a keyboard-accessible control (click, Enter, or Space) that opens the filter editor for that field.
- **Autofocus on value**: When opened from a chip, the `FilterMenu` focuses the **Value** input immediately for text fields, or the **first checkbox** for checkbox groups.
- **No backend calls**: All filtering remains purely client-side based on the current list response.

### Developer details

- `FilterMenu` now exposes an **imperative API** via `forwardRef` / `useImperativeHandle`:

  - `open()` — open the popover
  - `close()` — close and reset internal editor state
  - `openForField(key)` — open and jump straight to the editor for the given field, with autofocus on the value input/first checkbox

- `ActiveFilterChips` now accepts an optional `onEdit(key)` callback. Chips call this when the user clicks or presses Enter/Space.
- In `Grid`, we create a `filterMenuRef` and wire chips to `filterMenuRef.current.openForField(key)`.
- The “remove (X)” icon on a chip calls `stopPropagation()` so removing a rule doesn’t accidentally trigger editing.
- Accessibility: proper ARIA roles/labels; arrow-key navigation in field list; `Enter` applies; `Ctrl/Cmd+Enter` applies from anywhere; `Esc` closes.

### Minimal integration example

```jsx
// in Grid.js
const filterMenuRef = useRef(null);

<ActiveFilterChips
  filter={grid.filter}
  onRemove={removeFilter}
  onEdit={(key) => filterMenuRef.current?.openForField(key)} // ← new
/>

<GridHeader
  /* ...other props... */
  filterMenuRef={filterMenuRef} // ← pass ref down to FilterMenu
/>
```

---

## 💾 Filter Persistence Across Navigation

**New Feature**: Filters are now automatically persisted across page navigation using React Context!

By default, when you apply filters to a grid and navigate to another page, your filters will be restored when you return to that page.

### How It Works

- Each grid is identified by its `apiUrl` prop
- Filters are stored in the `FilterContext` with the `apiUrl` as the key
- When you navigate away and come back, the grid automatically restores the filters
- Each grid maintains its own independent filter state

### Usage

**Enable persistence (default behavior):**
```jsx
<Grid apiUrl="admin/users" persistFilters={true}>
  {/* ... */}
</Grid>
```

**Disable persistence for a specific grid:**
```jsx
<Grid apiUrl="admin/users" persistFilters={false}>
  {/* ... */}
</Grid>
```

### Example Scenario

1. User navigates to `/admin/users`
2. User applies filters: `Status = Active`, `Role = Admin`
3. User navigates to `/admin/companies`
4. User navigates back to `/admin/users`
5. ✅ Filters are automatically restored: `Status = Active`, `Role = Admin`

### Technical Details

- Filter state is managed by `FilterContext` in `src/context/FilterContext.js`
- The context stores both filters and searchForm (field definitions) per grid:
  - Filters: `{ "admin/users": {...filters}, "admin/companies": {...filters} }`
  - SearchForms: `{ "admin/users": {...fieldDefs}, "admin/companies": {...fieldDefs} }`
- **SearchForm persistence ensures all filter field options remain available** when navigating between pages
- Filters persist for the session (cleared on page refresh)
- To implement persistent storage across sessions, modify `FilterContext` to use `localStorage`

### Clear All Filters

To programmatically clear filters for a specific grid:

```jsx
import { useFilter } from "@/context/FilterContext";

const { clearFilter } = useFilter();

// Clear filters for a specific grid
clearFilter("admin/users");
```

---

## Breaking Changes

- **Filter editing API surfaced via imperative ref**:
  `FilterMenu` is now `forwardRef`-based with `openForField(key)`.
  If you previously tried to control the menu without a ref, update your integration to pass a `filterMenuRef` into `GridHeader` → `FilterMenu`, and trigger `openForField(key)` from chip clicks or other UI.
  The chip remove button also uses `stopPropagation()` to avoid unintentionally opening the editor.

---

## Change History

### 2025-10-16

- **ActiveFilterChips → click to edit** the selected field; keyboard-accessible (Enter/Space).
- **FilterMenu → `openForField(key)`** to open targeted field with **autofocus on value**.
- Improved a11y: arrow-key field navigation, `Enter` to apply, `Esc` to close, `Ctrl/Cmd+Enter` apply from anywhere.
- No changes to backend behaviour; filtering remains **client-side**.

---

✅ **Summary:**
Users can now directly **click an active filter chip** to reopen and edit that specific filter field.
The menu **autofocuses the value input** for quick editing, maintaining a smooth and accessible client-side filtering workflow.

---

Would you like me to also add a small **visual diagram** (Flow: _Chip click → FilterMenu open → Value focus → Apply → Grid refresh_) to this README to illustrate the new interaction?

---

## 🧱 File Structure

```
DynamicGrid/
│
├── Grid.js                  # Core wrapper
├── components/
│   ├── DataTable.js         # Renders table body and actions
│   ├── GridHeader.js        # Grid header + buttons + filters
│   ├── ActiveFilterChips.js # Display active filters
│   ├── FilterMenu.js        # Filter menu dropdown
│   ├── IconMap.js           # Icon registry (Radix UI)
│
├── hooks/
│   ├── useGridData.js       # Fetches and normalises data
│   ├── useActionFunctions.js
│
└── utils/
    └── html_markup.js       # Safe markup rendering helper
```

---

## 🧭 Developer Notes

- `showActions` is **deprecated** — the grid auto-detects if `<Grid.Action>` exists.
- `record.actions` (from API) is **no longer supported**.
- To style consistently, always use `intentClasses()` instead of hardcoded classes.
- Icons can be sourced from your Radix `IconMap` or imported manually.
- The Actions column will only render when a `<Grid.Action>` is defined.

---

## 🚨 Breaking Changes (vNext)

| Area                     | Previous Behaviour                                                  | New Behaviour                                                                                        |
| ------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Actions**              | Automatically generated from `record.actions` in API response       | Must be defined via `<Grid.Action>` manually                                                         |
| **showActions prop**     | Controlled whether to display the Actions column                    | Deprecated — grid auto-detects `<Grid.Action>`                                                       |
| **Backend coupling**     | Required server-defined action schema (`func_name`, `intent`, etc.) | Frontend-only; API no longer dictates UI logic                                                       |
| **Default dropdown**     | Rendered automatically when backend provided `actions`              | Removed — you must define your dropdown manually                                                     |
| **Theme injection**      | Partial                                                             | Full theme helpers (`intentClasses`, `getIcon`, `RightSlot`) now passed to your custom `Grid.Action` |
| **Inline quick buttons** | Supported in old versions                                           | Removed for visual consistency; dropdowns only                                                       |
| **Column Manager**       | Controls table column display                                       | Removed Functionality                                                                                |

---

✅ **Migration Notes**

1. Remove any backend logic populating `record.actions`.
2. Remove all references to `showActions`.
3. Add a `<Grid.Action>` block for every grid needing actions.
4. Use `intentClasses()` and `getIcon()` for consistent styling.
5. Your data-fetching (`apiUrl`) and grid logic remain unchanged.
6. Remove any instance/declarations of ColumnManager.

---
