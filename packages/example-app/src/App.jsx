import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeToggle } from "./components/themeToggle.jsx";
import ExampleGridPage from "./pages/ExampleGridPage.jsx"; // Importing the new component

export default function App() {

  return (
    <Router>
      <div className="relative w-full mx-auto mt-10">
        <div className="w-full  mx-auto p-8 space-y-8">
          <h1 className="text-3xl font-bold">
            Dynamic Grid Example
            <ThemeToggle />
          </h1>

          <hr className="my-6" />

          {/* Route Definitions */}
          <Routes>
            <Route path="/" element={<ExampleGridPage />} />
          </Routes>

        </div>
      </div>
    </Router>
  );
}
