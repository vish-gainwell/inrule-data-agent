import assert from "node:assert/strict";
import test from "node:test";
import {
  buildExecuteQueryRequest,
  normalizeExecuteQueryResponse,
} from "./executeQueryAdapter.js";

test("builds backend execute_query request for generated SQL", () => {
  assert.deepEqual(
    buildExecuteQueryRequest({
      sql: "SELECT COUNT(*) AS Cnt FROM HRX.dbo.DrugOverrides",
    }),
    {
      sql: "SELECT COUNT(*) AS Cnt FROM HRX.dbo.DrugOverrides",
      params: {},
    },
  );
});

test("normalizes backend execute_query rows response", () => {
  const result = normalizeExecuteQueryResponse({
    columns: ["Cnt"],
    rows: [[1]],
    row_count: 1,
    execution_ms: 42.5,
  });

  assert.deepEqual(result.columns, ["Cnt"]);
  assert.deepEqual(result.rows, [[1]]);
  assert.equal(result.rowCount, 1);
  assert.equal(result.executionMs, 42.5);
});
