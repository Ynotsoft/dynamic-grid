import { useEffect } from "react";

/**
 * Preserve legacy window-based action wiring.
 */
export default function useActionFunctions(actionsFunctions) {
  useEffect(() => {
    if (!actionsFunctions) return;
    Object.entries(actionsFunctions).forEach(([, value]) => {
      const originalFunc = window[value.func_name];
      if (typeof originalFunc === "function") {
        window[value.func_name] = (e) => originalFunc(e);
      } else {
        console.warn(`Function ${value.func_name} does not exist on window`);
      }
    });
  }, [actionsFunctions]);
}
