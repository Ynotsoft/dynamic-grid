import "./App.css";
import axios from "axios";
import { DynamicGrid as Grid } from "ynotsoft-dynamic-grid";

// Optional: local dummy dataset matching the README's productsResponse (not used by default)
const productsResponse = {
  headers: [
    { title: "Product ID", sortKey: "ProductID", display: false, field: "ProductID", isPrimaryKey: true },
    { title: "Product Name", sortKey: "ProductName", display: true, field: "ProductName", isPrimaryKey: false },
    { title: "Category", sortKey: "Category", display: true, field: "Category", isPrimaryKey: false },
    { title: "In Stock", sortKey: "InStock", display: true, field: "InStock", isPrimaryKey: false },
    { title: "Available Date", sortKey: "AvailableDate", display: true, field: "AvailableDate", isPrimaryKey: false }
  ],
  filters: {
    ProductName: { field: "ProductName", type: "Text", title: "Product Name", source: {} },
    Category: { field: "Category", type: "Text", title: "Category", source: {} },
    InStock: { field: "InStock", type: "Checkbox", title: "In Stock", source: { "1": "Yes", "2": "No" } },
    AvailableDate: { field: "AvailableDate", type: "Date", title: "Available Date", source: {} }
  },
  enableCheckbox: true,
  records: [
    { ProductID: 1, ProductName: "Wireless Mouse", Category: "Accessories", InStock: true, AvailableDate: "2024-03-01" },
    { ProductID: 2, ProductName: "USB-C Hub", Category: "Accessories", InStock: false, AvailableDate: "2024-03-10" }
  ],
  totalCount: 2
};

// Optional: mock API client using the local productsResponse (example, not used)
const mockClient = {
  post: async (_url, _body) => ({ data: productsResponse })
};

function App() {
  const token = "your_api_token_here"; // Replace with your actual token
  const apiClient = axios.create({
    baseURL: "/",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return (
    <>
      <h1>Dynamic Grid Example</h1>
      <Grid
        apiUrl={`data.json`} // Also works with "/data.json"
        apiClient={apiClient}
        pageLength={10}
        showExportButton={true}
        noRecordsMessage="No applications in this environment"
        onSelectedRows={(selectedIds) => {
          console.log("Selected Application IDs:", selectedIds);
        }}
      ></Grid>

      {/** Example using the mock client (uncomment to try without fetching data.json)
      <Grid
        apiUrl="/products"
        apiClient={mockClient}
        pageLength={10}
        onSelectedRows={(ids) => console.log("Selected IDs", ids)}
      />
      */}
    </>
  );
}

export default App;
