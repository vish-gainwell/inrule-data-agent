// src/components/SchemaExplorer.jsx
import React, { useState } from "react";
import { getSchemaConfig } from "../config/schemaConfig";

const SchemaExplorer = ({ tenantId }) => {
  const config = getSchemaConfig(tenantId);

  if (!config) {
    return (
      <div className="text-xs text-gray-500">
        No schema configured for {tenantId}.
      </div>
    );
  }

  const [openDbs, setOpenDbs] = useState({});
  const [openSchemas, setOpenSchemas] = useState({});
  const [openTables, setOpenTables] = useState({});

  const toggleDb = (dbName) => {
    setOpenDbs((prev) => ({ ...prev, [dbName]: !prev[dbName] }));
  };

  const toggleSchema = (dbName, schemaName) => {
    const key = `${dbName}.${schemaName}`;
    setOpenSchemas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTable = (dbName, schemaName, tableName) => {
    const key = `${dbName}.${schemaName}.${tableName}`;
    setOpenTables((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const coverageClass = (coverage) => {
    if (coverage === "covered") return "bg-green-100 text-green-700";
    if (coverage === "in_memory") return "bg-blue-100 text-blue-700";
    if (coverage === "missing") return "bg-red-100 text-red-700";
    if (coverage === "not_loaded") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  const columnLabel = (column) => {
    if (typeof column === "string") return column;
    const type = [column.type, column.length].filter(Boolean).join("");
    return [column.name, type ? `: ${type}` : ""].join("");
  };

  return (
    <div className="text-xs text-gray-800">
      {config.databases.map((db) => {
        const dbOpen = openDbs[db.name] ?? true;

        return (
          <div key={db.name} className="mb-3">
            <button
              type="button"
              className="flex w-full items-center gap-1 rounded px-1 py-1 text-left font-semibold text-gray-900 hover:bg-gray-100"
              onClick={() => toggleDb(db.name)}
            >
              <span className="inline-block w-3 text-[10px]">
                {dbOpen ? "v" : ">"}
              </span>
              <span className="truncate font-sans" title={db.name}>
                {db.name}
              </span>
            </button>

            {dbOpen && (
              <div className="ml-4 mt-1">
                {db.schemas.map((schema) => {
                  const schemaKey = `${db.name}.${schema.name}`;
                  const schemaOpen = openSchemas[schemaKey] ?? true;

                  return (
                    <div key={schema.name} className="mb-1">
                      <button
                        type="button"
                        className="flex w-full items-center gap-1 rounded px-1 py-1 text-left text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => toggleSchema(db.name, schema.name)}
                      >
                        <span className="inline-block w-3 text-[10px]">
                          {schemaOpen ? "v" : ">"}
                        </span>
                        <span className="truncate font-sans">
                          {schema.name}
                        </span>
                      </button>

                      {schemaOpen && (
                        <ul className="ml-4 mt-1 max-h-72 space-y-1 overflow-y-auto rounded-md border border-gray-200 bg-white/70 p-1 pr-2">
                          {schema.tables.map((table) => {
                            const tableKey = `${db.name}.${schema.name}.${table.name}`;
                            const tableOpen = openTables[tableKey] ?? false;
                            const columns = Array.isArray(table.columns)
                              ? table.columns
                              : [];

                            return (
                              <li key={table.name}>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-1 rounded px-1 py-1 text-left hover:bg-gray-100"
                                  onClick={() =>
                                    toggleTable(
                                      db.name,
                                      schema.name,
                                      table.name,
                                    )
                                  }
                                >
                                  <span className="inline-block w-3 text-[10px]">
                                    {tableOpen ? "v" : ">"}
                                  </span>
                                  <span
                                    className="min-w-0 flex-1 truncate font-sans"
                                    title={table.name}
                                  >
                                    {table.name}
                                  </span>
                                  {table.coverage && (
                                    <span
                                      className={`ml-1 rounded px-1.5 py-0.5 text-[9px] uppercase ${coverageClass(table.coverage)}`}
                                      title={table.reason || table.coverage}
                                    >
                                      {table.coverage}
                                    </span>
                                  )}
                                </button>

                                {tableOpen && (
                                  <div className="ml-6 mt-1">
                                    {table.reason && (
                                      <div className="mb-1 text-[10px] text-gray-500">
                                        {table.reason}
                                      </div>
                                    )}
                                    {columns.length > 0 ? (
                                      <ul className="space-y-0.5">
                                        {columns.map((column) => {
                                          const key =
                                            typeof column === "string"
                                              ? column
                                              : column.name;
                                          const meta =
                                            typeof column === "string"
                                              ? {}
                                              : column;
                                          return (
                                            <li
                                              key={key}
                                              className="truncate font-sans text-[11px] text-gray-600"
                                              title={
                                                meta.description ||
                                                columnLabel(column)
                                              }
                                            >
                                              <span>{columnLabel(column)}</span>
                                              {meta.pk && (
                                                <span className="ml-1 rounded bg-blue-100 px-1 text-[9px] text-blue-700">
                                                  PK
                                                </span>
                                              )}
                                              {meta.nullable && (
                                                <span className="ml-1 text-[9px] text-gray-400">
                                                  nulls: {meta.nullable}
                                                </span>
                                              )}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    ) : (
                                      <div className="text-[11px] italic text-gray-500">
                                        Columns unavailable in local schema
                                        workbook.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SchemaExplorer;
