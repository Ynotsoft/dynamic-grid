import css from "./index.css?inline";

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
}

export { default as DynamicGrid } from "./DynamicGrid/DynamicGrid.jsx";
import DynamicGridComponent from "./DynamicGrid/DynamicGrid.jsx";
export default DynamicGridComponent;
