import React, { useState } from "react";
import SqlEditor from "./SqlEditor";
import { format as sqlFormat } from "sql-formatter";
import ResultsTable from "../ResultsTable";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const findingText = (finding) => {
  if (typeof finding === "string") return finding;
  if (!finding || typeof finding !== "object") return String(finding ?? "");
  return [finding.code, finding.message].filter(Boolean).join(": ");
};

const validationLabel = (level) => {
  if (level === "ok") return "Validation passed";
  if (level === "blocked") return "Validation blocked";
  return "Needs review";
};



const ChatBubble = ({
  message,
  onEditToggle,
  onValidate,
  onRun,
  executeQuery,
  onFavorite,
  favoriteState,
  isLoading,
}) => {
  const [editValue, setEditValue] = useState(message.content ?? "");
  const [generatedQueryView, setGeneratedQueryView] = useState("queries");

  // Use role *or* type so it works in both Analyst and ChatInterface
  const isUser = message.role === "user" || message.type === "user";

  // --- 1) Validation / status banner ---------------------------------------
  const isValidation =
    message.kind === "validation" || message.statusMessage === "validation";

  if (isValidation) {
    return (
      <div className="w-full my-3">
        <div className="status-banner">
          <span className="status-icon">☑</span>
          <span>{message.content || "Query is valid and ready to run."}</span>
        </div>
      </div>
    );
  }

  // --- 2) Normal chat bubbles ----------------------------------------------
  const bubbleBase = "p-5 rounded-xl max-w-[75%] mb-5";

  // Tailwind: User (Blue, Right) vs System (Gray, Left)
  const bubbleColor = isUser
    ? "bg-userbubble text-softblack ml-auto rounded-br-none"
    : "bg-systembubble text-softblack mr-auto rounded-bl-none";

  // Error State
  const errorClass = message.isError
    ? "bg-error border border-errorText text-errorText"
    : "";

  // Copy logic

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(safeSqlFormat(message.content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditClick = () => {
    if (!onEditToggle) return;
    setEditValue(message.content ?? "");
    onEditToggle(message.id);
  };

  const handleValidateClick = () => {
    if (!onValidate) return;
    onValidate(message.id, editValue);
  };

  const handleRunClick = (isPreview) => {
    if (!onRun) return;
    onRun(message.id, isPreview);
  };

  const handleFavoriteClick = () => {
    if (!onFavorite || favoriteState === "saved") return;
    onFavorite(message);
  };

  const toDisplayText = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value.trim();
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const parseCriteriaAnalyzerText = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed[0] !== "{") return null;

    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.steps)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  const criteriaAnalyzerInput = isUser
    ? parseCriteriaAnalyzerText(message.content)
    : null;

  const safeSqlFormat = (sql) => {
    if (!sql) return "";
    try {
      // Try with tsql dialect first (supported in newer sql-formatter versions)
      return sqlFormat(sql, { language: "tsql" });
    } catch (e1) {
      // Strip DECLARE/SET lines so tokenizer doesn't choke
      const stripped = sql
        // Remove DECLARE @var ...;
        .replace(/^\s*DECLARE\s+@[\s\S]*?;?\s*$/gim, "")
        // Remove SET @var = ...;
        .replace(/^\s*SET\s+@[\s\S]*?;?\s*$/gim, "")
        // Remove GO batch separators (harmless but cleaner)
        .replace(/^\s*GO\s*$/gim, "")
        .trim();

      try {
        // Try tsql again after stripping (or default)
        // Prefer tsql; if it still throws in your env, swap to: sqlFormat(stripped)
        return sqlFormat(stripped, { language: "tsql" });
      } catch (e2) {
        // Final fallback: do not format (avoid crashing the UI)
        console.warn("[ChatBubble] sql-format failed; returning raw SQL.", {
          e1,
          e2,
        });
        return sql;
      }
    }
  };

  const suggestionText = toDisplayText(message.faithfulness_summary_reason);
  const disclaimerText = toDisplayText(message.faithfulness_recommendation);

  if (message.isPartASql) {
    const blockingErrors = Array.isArray(message.blocking_errors)
      ? message.blocking_errors
      : [];
    const warnings = Array.isArray(message.warnings) ? message.warnings : [];
    const joins = Array.isArray(message.joinAssumptions)
      ? message.joinAssumptions
      : [];
    const selectedTables = Array.isArray(message.selectedTables)
      ? message.selectedTables
      : [];
    const selectedColumns = Array.isArray(message.selectedColumns)
      ? message.selectedColumns
      : [];
    const isBlocked = !message.canGenerate || blockingErrors.length > 0;
    const copySql = () => {
      navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex w-full">
        <div className="p-5 rounded-xl max-w-[85%] mb-5 bg-systembubble text-softblack mr-auto rounded-bl-none">
          <div className="flex justify-between items-center border-b border-gray-400/30 pb-2 mb-3">
            <div>
              <h3 className="font-semibold text-sm">
                {message.title || "Generated SQL Draft"}
              </h3>
              <div className="text-xs text-secondary mt-1">
                Confidence: {message.confidence || "low"}
                {message.reason ? ` · ${message.reason}` : ""}
              </div>
            </div>
            {message.content && (
              <button
                className="text-xs flex items-center px-2 py-1 rounded hover:bg-black/10 text-secondary"
                onClick={copySql}
              >
                {copied ? "Copied" : "Copy SQL"}
              </button>
            )}
          </div>

          {message.content ? (
            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold uppercase text-secondary">
                Read-only generated SQL
              </div>
              <div className="bg-softblack text-cream p-4 rounded-lg overflow-y-auto max-h-96 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  {safeSqlFormat(message.content)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              SQL was not generated.
              {message.nextAction ? ` Next action: ${message.nextAction}.` : ""}
            </div>
          )}

          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              isBlocked
                ? "border-red-200 bg-red-50 text-red-800"
                : warnings.length > 0
                  ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                  : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            <div className="font-semibold">
              {isBlocked
                ? "Generation blocked"
                : warnings.length > 0
                  ? "Generated SQL needs review"
                  : "Generated SQL passed validation"}
            </div>
            {blockingErrors.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {blockingErrors.map((finding, index) => (
                  <li key={`block-${index}`}>{findingText(finding)}</li>
                ))}
              </ul>
            )}
            {warnings.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {warnings.map((finding, index) => (
                  <li key={`warn-${index}`}>{findingText(finding)}</li>
                ))}
              </ul>
            )}
            {Array.isArray(message.missing) && message.missing.length > 0 && (
              <div className="mt-2">
                Missing schema: {message.missing.join(", ")}
              </div>
            )}
          </div>

          {joins.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase text-secondary">
                Join assumptions
              </div>
              <div className="space-y-2">
                {joins.map((join, index) => (
                  <div
                    key={index}
                    className="rounded border border-gray-200 bg-white p-3 text-sm"
                  >
                    <div className="font-mono text-xs text-softblack">
                      {join.predicate || "Join predicate"}
                    </div>
                    <div className="mt-1 text-xs text-secondary">
                      Confidence: {join.confidence ?? "unknown"}
                    </div>
                    {Array.isArray(join.evidence) &&
                      join.evidence.length > 0 && (
                        <div className="mt-1 text-xs text-secondary">
                          Evidence: {join.evidence.join(", ")}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(selectedTables.length > 0 || selectedColumns.length > 0) && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-semibold text-secondary">
                Grounding details
              </summary>
              {selectedTables.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold uppercase text-secondary">
                    Tables
                  </div>
                  <ul className="list-disc pl-5">
                    {selectedTables.map((table) => (
                      <li key={table}>{table}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedColumns.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold uppercase text-secondary">
                    Columns
                  </div>
                  <ul className="list-disc pl-5">
                    {selectedColumns.map((column) => (
                      <li key={column}>{column}</li>
                    ))}
                  </ul>
                </div>
              )}
            </details>
          )}

          <div className="mt-4 pt-3 border-t border-gray-400/30 flex flex-wrap gap-2">
            <button
              className="bg-secondary text-white px-4 py-2 rounded text-xs font-semibold hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => executeQuery?.(true, message)}
              disabled={isBlocked || isLoading}
              title={
                isBlocked
                  ? "Blocked SQL cannot be executed"
                  : "Call /execute_query and show the typed DB_UNAVAILABLE response"
              }
            >
              Preview (10 rows)
            </button>
            <button
              className="bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => executeQuery?.(false, message)}
              disabled={isBlocked || isLoading}
              title={
                isBlocked
                  ? "Blocked SQL cannot be executed"
                  : "Call /execute_query and show the typed DB_UNAVAILABLE response"
              }
            >
              Run full query
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (message.isGeneratedQueries) {
    const steps = Array.isArray(message.steps) ? message.steps : [];
    const totalQueries = steps.reduce(
      (count, step) =>
        count + (Array.isArray(step.queries) ? step.queries.length : 0),
      0,
    );

    const responseJson = JSON.stringify(
      message.rawResponse ?? {
        edit_id: message.editId,
        queries: steps.map((step) => step.raw ?? step),
      },
      null,
      2,
    );

    const copyAllQueries = () => {
      const text = steps
        .flatMap((step) =>
          (step.queries || []).map(
            (query, index) =>
              `-- Step ${step.stepNumber}, Query ${index + 1}\n${query}`,
          ),
        )
        .join("\n\n");
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const copyResponseJson = () => {
      navigator.clipboard.writeText(responseJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex w-full">
        <div className="p-5 rounded-xl max-w-[90%] mb-5 bg-systembubble text-softblack mr-auto rounded-bl-none">
          <div className="flex justify-between items-center border-b border-gray-400/30 pb-2 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Generated Data Queries</h3>
              <div className="text-xs text-secondary mt-1">
                Edit {message.editId || "unknown"} · {totalQueries} SQL quer
                {totalQueries === 1 ? "y" : "ies"}
              </div>
            </div>
            <button
              className="text-xs flex items-center px-2 py-1 rounded hover:bg-black/10 text-secondary disabled:opacity-50"
              onClick={generatedQueryView === "json" ? copyResponseJson : copyAllQueries}
              disabled={generatedQueryView !== "json" && totalQueries === 0}
            >
              {copied
                ? "Copied"
                : generatedQueryView === "json"
                  ? "Copy JSON"
                  : "Copy All SQL"}
            </button>
          </div>

          <div className="mb-4 inline-flex rounded-lg border border-gray-300 bg-white p-1 text-xs font-semibold">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 transition ${
                generatedQueryView === "queries"
                  ? "bg-primary text-white shadow-sm"
                  : "text-secondary hover:bg-gray-100"
              }`}
              onClick={() => setGeneratedQueryView("queries")}
            >
              Queries
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 transition ${
                generatedQueryView === "json"
                  ? "bg-primary text-white shadow-sm"
                  : "text-secondary hover:bg-gray-100"
              }`}
              onClick={() => setGeneratedQueryView("json")}
            >
              Response JSON
            </button>
          </div>

          {generatedQueryView === "json" ? (
            <div className="bg-softblack text-cream p-4 rounded-lg overflow-y-auto max-h-[32rem] font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {responseJson}
              </pre>
            </div>
          ) : steps.length === 0 ? (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              No steps required data queries.
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, stepIndex) => (
                <div
                  key={`${step.stepNumber ?? stepIndex}`}
                  className="border border-gray-200 rounded-lg bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="font-semibold text-sm">
                      Step {step.stepNumber ?? "?"}
                    </div>
                    <span
                      className={`text-xs rounded-full px-2 py-1 ${
                        step.matched
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {step.matched
                        ? `${step.queries.length} matched`
                        : "No match"}
                    </span>
                  </div>
                  {step.businessMeaning && (
                    <div className="text-xs text-secondary mb-3 whitespace-pre-wrap">
                      {step.businessMeaning}
                    </div>
                  )}
                  {step.matched ? (
                    <div className="space-y-3">
                      {step.queries.map((query, queryIndex) => (
                          <div key={queryIndex}>
                            <div className="mb-1 text-xs font-semibold uppercase text-secondary">
                              Query {queryIndex + 1}
                            </div>
                            <div className="bg-softblack text-cream p-4 rounded-lg overflow-y-auto max-h-96 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                              <pre
                                style={{
                                  margin: 0,
                                  whiteSpace: "pre-wrap",
                                  wordWrap: "break-word",
                                }}
                              >
                                {query}
                              </pre>
                            </div>
                            {executeQuery && (
                              <button
                                className="mt-2 bg-primary text-white px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-60"
                                disabled={isLoading}
                                onClick={() =>
                                  executeQuery(false, {
                                    generated_sql: query,
                                    isGeneratedQuerySql: true,
                                    op_id: message.op_id,
                                  })
                                }
                              >
                                Execute
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                      No supported SQL template matched this business meaning.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.isTemplate) {
    const validation = message.validation || {
      level: "needs_review",
      blocking_errors: [],
      warnings: [],
    };
    const isBlocked = validation.level === "blocked";
    const findings = isBlocked
      ? validation.blocking_errors
      : validation.warnings;
    const queryParamsText = JSON.stringify(message.queryParams || {}, null, 2);

    const copyQueryText = () => {
      navigator.clipboard.writeText(message.queryText || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex w-full">
        <div className="p-5 rounded-xl max-w-[85%] mb-5 bg-systembubble text-softblack mr-auto rounded-bl-none">
          <div className="flex justify-between items-center border-b border-gray-400/30 pb-2 mb-3">
            <div>
              <h3 className="font-semibold text-sm">Approved Query Template</h3>
              <div className="text-xs text-secondary mt-1">
                {message.templateId || "Template"}
              </div>
            </div>
            <button
              className="text-xs flex items-center px-2 py-1 rounded hover:bg-black/10 text-secondary"
              onClick={copyQueryText}
            >
              {copied ? "Copied" : "Copy QueryText"}
            </button>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase text-secondary">
              Immutable QueryText
            </div>
            <div className="bg-softblack text-cream p-4 rounded-lg overflow-y-auto max-h-96 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {message.queryText || ""}
              </pre>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase text-secondary">
              Generated QueryParams
            </div>
            <div className="bg-white border border-gray-200 text-softblack p-4 rounded-lg overflow-y-auto max-h-72 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {queryParamsText}
              </pre>
            </div>
          </div>

          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              validation.level === "ok"
                ? "border-green-200 bg-green-50 text-green-800"
                : isBlocked
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-yellow-200 bg-yellow-50 text-yellow-800"
            }`}
          >
            <div className="font-semibold">
              {validationLabel(validation.level)}
            </div>
            {Array.isArray(findings) && findings.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {findings.map((finding, index) => (
                  <li key={index}>{findingText(finding)}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-400/30 flex flex-wrap gap-2">
            <button
              className="bg-secondary text-white px-4 py-2 rounded text-xs font-semibold hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => executeQuery?.(true, message)}
              disabled={isBlocked || isLoading}
              title={
                isBlocked
                  ? "Blocked validation cannot be executed"
                  : "Call /execute_query and show the typed DB_UNAVAILABLE response"
              }
            >
              Preview (10 rows)
            </button>
            <button
              className="bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => executeQuery?.(false, message)}
              disabled={isBlocked || isLoading}
              title={
                isBlocked
                  ? "Blocked validation cannot be executed"
                  : "Call /execute_query and show the typed DB_UNAVAILABLE response"
              }
            >
              Run full query
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <div
        className={`${bubbleBase} ${
          message.isError ? errorClass : bubbleColor
        }`}
      >
        {/* Header */}
        {message.title && (
          <div className="flex justify-between items-center border-b border-gray-400/30 pb-2 mb-3">
            <h3 className="font-semibold text-sm">{message.title}</h3>
            {message.isSql && (
              <div className="flex gap-2">
                <button
                  className={`text-xs flex items-center px-2 py-1 rounded hover:bg-black/10 ${
                    message.isEditing
                      ? "text-white bg-success hover:bg-green-700"
                      : "text-secondary"
                  }`}
                  onClick={
                    message.isEditing ? handleValidateClick : handleEditClick
                  }
                >
                  {message.isEditing ? "Validate" : "Edit"}
                </button>
                <button
                  className="text-xs flex items-center px-2 py-1 rounded hover:bg-black/10 text-secondary"
                  onClick={handleCopy}
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {message.isSql ? (
          message.isEditing ? (
            <SqlEditor value={editValue} onChange={setEditValue} />
          ) : (
            <div className="bg-softblack text-cream p-4 rounded-lg overflow-y-auto max-h-96 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              <div className="flex justify-end">
                <button
                  onClick={handleCopy}
                  aria-label="Copy SQL"
                  className="mt-1 mb-2 inline-flex items-center gap-2 rounded-md bg-gray-800/90 text-white px-3 py-1.5
                              shadow-sm ring-1 ring-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2
                              focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="shrink-0"
                  >
                    <path d="M10 1.5a.5.5 0 0 1 .5.5v1h1A1.5 1.5 0 0 1 13 4.5v8A1.5 1.5 0 0 1 11.5 14h-7A1.5 1.5 0 0 1 3 12.5v-8A1.5 1.5 0 0 1 4.5 3h1v-1A.5.5 0 0 1 6 1.5h4zM6 2v1h4V2H6z" />
                  </svg>
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {message.content ? safeSqlFormat(message.content) : ""}
              </pre>
            </div>
          )
        ) : criteriaAnalyzerInput ? (
          <div className="rounded-lg border border-blue-200 bg-white/80 p-4 text-softblack shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3 border-b border-blue-100 pb-3">
              <div>
                <div className="text-sm font-semibold">Criteria Analyzer Request</div>
                <div className="mt-1 text-xs text-secondary">
                  Edit {criteriaAnalyzerInput.edit_id || "unknown"} · {criteriaAnalyzerInput.steps.length} steps · {criteriaAnalyzerInput.steps.filter((step) => step?.requires_data_query).length} data queries requested
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase text-blue-700">
                User input
              </span>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
              {criteriaAnalyzerInput.steps.map((step, index) => (
                <div
                  key={`${step?.step_number ?? index}`}
                  className="rounded-md border border-gray-200 bg-white p-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold">
                      Step {step?.step_number ?? index + 1}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        step?.requires_data_query
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {step?.requires_data_query ? "Data query" : "No data query"}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed text-gray-700">
                    {step?.business_meaning || "No business meaning provided."}
                  </div>
                  {step?.ado_criterion_ref && (
                    <div className="mt-2 text-[11px] text-gray-500">
                      Ref: {step.ado_criterion_ref}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : isUser ? (
          <div className="rounded-lg border border-blue-200 bg-white/80 p-4 text-softblack shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3 border-b border-blue-100 pb-3">
              <div>
                <div className="text-sm font-semibold">User Request</div>
                <div className="mt-1 text-xs text-secondary">
                  Natural language input
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase text-blue-700">
                User input
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto whitespace-pre-wrap pr-2 text-sm leading-relaxed text-gray-800">
              {message.content}
            </div>
          </div>
        ) : (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        )}

        {message.isSql && !!disclaimerText && (
          <div className="query-disclaimer">
            <span className="query-disclaimer-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M7.938 2.016a.13.13 0 0 1 .125 0l6.857 11.856c.05.087.05.195 0 .282a.13.13 0 0 1-.125.066H1.205a.13.13 0 0 1-.125-.066.28.28 0 0 1 0-.282L7.938 2.016zM8 5c-.352 0-.635.287-.622.638l.189 4.222a.433.433 0 0 0 .866 0l.189-4.222A.63.63 0 0 0 8 5zm.002 6a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z" />
              </svg>
            </span>
            <div className="query-disclaimer-text">
              <strong>Suggestion:</strong> {suggestionText}
            </div>
          </div>
        )}

        {message.isSql && !!suggestionText && (
          <div className="sql-faithfulness-suggestion">
            <span
              className="sql-faithfulness-suggestion-icon"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M2 6a6 6 0 1 1 10.174 4.285c-.203.203-.348.444-.422.706a1 1 0 0 1-.97.74h-5.56a1 1 0 0 1-.97-.74 2.04 2.04 0 0 0-.422-.706A5.98 5.98 0 0 1 2 6zm6-4a4 4 0 0 0-3.39 6.126c.4.61.798 1.083 1.141 1.5.226.275.44.54.605.79h3.288c.165-.25.38-.515.605-.79.343-.417.742-.89 1.141-1.5A4 4 0 0 0 8 2z" />
                <path d="M5 12.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm1 2a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5z" />
              </svg>
            </span>
            <div className="sql-faithfulness-suggestion-title">
              <strong>Disclaimer:</strong> {disclaimerText}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {message.isSql && (
          <div className="mt-4 pt-3 border-t border-gray-400/30 flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button
                className="bg-secondary text-white px-4 py-2 rounded text-xs font-semibold hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => executeQuery(true, message)}
                disabled={isLoading}
              >
                Preview (10 rows)
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => executeQuery(false, message)}
                disabled={isLoading}
              >
                Run full query
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-white transition-opacity ${
                  favoriteState === "saved"
                    ? "bg-[#999999] cursor-default"
                    : "bg-[#d4880f] hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                }`}
                onClick={handleFavoriteClick}
                disabled={isLoading || favoriteState === "saving"}
                title={
                  favoriteState === "saved"
                    ? "Already saved to Prompt Library"
                    : "Save to Prompt Library"
                }
              >
                {favoriteState === "saved" ? (
                  <StarIcon sx={{ fontSize: 16 }} />
                ) : (
                  <StarBorderIcon sx={{ fontSize: 16 }} />
                )}
                {favoriteState === "saving"
                  ? "Saving..."
                  : favoriteState === "saved"
                    ? "Favorited"
                    : "Mark as Favorite"}
              </button>
            </div>
          </div>
        )}
        {message.resultsData?.rows.length > 0 && (
          <ResultsTable execution={message.resultsData} />
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
