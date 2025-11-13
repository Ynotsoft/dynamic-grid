import "./App.css";
import axios from "axios";
import { DynamicGrid as Grid } from "ynotsoft-dynamic-grid";

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
        apiUrl={`data.json`}
        apiClient={apiClient}
        pageLength={10}
        showExportButton={true}
        noRecordsMessage="No applications in this environment"
        onSelectedRows={(selectedIds) => {
          console.log("Selected Application IDs:", selectedIds);
        }}
      ></Grid>
    </>
  );
}

export default App;
