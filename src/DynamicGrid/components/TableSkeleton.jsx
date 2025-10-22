import React from "react";

export default function TableSkeleton({ rows = 5, columns = 3 }) {
  // Create an array of placeholders for rows and columns
  const rowPlaceholders = Array.from({ length: rows });
  const columnPlaceholders = Array.from({ length: columns });

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rowPlaceholders.map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {columnPlaceholders.map((_, colIndex) => (
            <td key={colIndex} className="py-2 px-2">
              <div className="h-2.5 bg-gray-300 rounded-full  w-3/4 mb-2"></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}