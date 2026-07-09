import React, { useState } from "react";
import SchemaExplorer from "../SchemaExplorer";
import {
  DEFAULT_SCHEMA_TENANT,
  getSchemaConfig,
} from "../../config/schemaConfig";

const SchemaSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const schemaConfig = getSchemaConfig(DEFAULT_SCHEMA_TENANT);

  return (
    <aside
      className={`flex h-full flex-shrink-0 flex-col border-r border-gray-300 bg-gray-50 font-sans transition-all duration-200 ${
        isCollapsed ? "w-14" : "w-72"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-gray-300 px-3">
        {!isCollapsed && (
          <div className="min-w-0 font-sans leading-tight">
            <div className="truncate text-sm font-semibold tracking-normal text-softblack">
              Database Schema
            </div>
            <div className="truncate text-xs font-normal tracking-normal text-secondary">
              {schemaConfig.label}
            </div>
          </div>
        )}

        <button
          type="button"
          className="rounded p-2 text-gray-600 hover:bg-gray-200"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={
            isCollapsed ? "Expand schema sidebar" : "Collapse schema sidebar"
          }
          title={
            isCollapsed ? "Expand schema sidebar" : "Collapse schema sidebar"
          }
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isCollapsed ? (
              <path d="M9 6l6 6-6 6" />
            ) : (
              <path d="M15 6l-6 6 6 6" />
            )}
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
          <SchemaExplorer tenantId={DEFAULT_SCHEMA_TENANT} />
        </div>
      )}

      {isCollapsed && (
        <div className="flex flex-1 items-start justify-center pt-4 text-gray-600">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
            <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
          </svg>
        </div>
      )}
    </aside>
  );
};

export default SchemaSidebar;
