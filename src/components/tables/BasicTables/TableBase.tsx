import React from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface TableBaseProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function TableBase<T extends { id: string | number }>({
  columns,
  data,
  loading,
  emptyMessage = "No hay datos para mostrar 📄",
  onRowClick,
  className,
}: TableBaseProps<T>) {
  return (
    <div className={`hidden md:block ${className || ""}`}>
      <table className="min-w-full text-sm text-gray-700 dark:text-gray-200">
        <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 uppercase text-xs">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key.toString()}
                className={clsx("py-3 px-4", {
                  "text-left": col.align === "left" || !col.align,
                  "text-center": col.align === "center",
                  "text-right": col.align === "right",
                })}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center">
                <Loader2 className="animate-spin inline-block text-indigo-500 w-6 h-6 mr-2" />
                Cargando datos...
              </td>
            </tr>
          ) : data?.length ? (
            data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-800 cursor-pointer"
              >
                {columns.map((col) => (
                  <td
                    key={col.key.toString()}
                    className={clsx("py-3 px-4", {
                      "text-left": col.align === "left" || !col.align,
                      "text-center": col.align === "center",
                      "text-right": col.align === "right",
                    })}
                  >
                    {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
