import { Children, cloneElement } from "react";

export const Column = () => null;
export const Action = () => null;

export function extractSlots(children) {
  const customColumns = {};
  let customActionRenderer = null;

  Children.forEach(children, (child) => {
    const typeName = child?.type?.name;
    if (typeName === "Column" && child?.props?.name) {
      customColumns[child.props.name] = child.props.children;
    } else if (typeName === "Action") {
      customActionRenderer = child.props?.children;
    }
  });

  return { customColumns, customActionRenderer };
}

export function renderCell(customColumns, record, colName, htmlMarkup) {
  if (customColumns[colName]) {
    const value = record[colName];
    const renderer = customColumns[colName];
    return typeof renderer === "function" ? renderer(value, record) : cloneElement(renderer, { value, record });
  }
  return <div dangerouslySetInnerHTML={htmlMarkup(record[colName])} />;
}
