import assert from "node:assert/strict";
import test from "node:test";

import { getSchemaConfig, listSchemaTables } from "./schemaConfig.js";

test("returns the default SQL Data Agent schema config", () => {
  const config = getSchemaConfig();

  assert.equal(config.label, "SQL Data Agent Schema");
  assert.ok(Array.isArray(config.databases));
  assert.ok(config.databases.length > 0);
});

test("lists the full derived MVP SQL tables shown in the schema sidebar", () => {
  const tables = listSchemaTables("MDWise");

  assert.equal(tables.length, 45);
  assert.ok(tables.includes("HRX.dbo.DrugOverrides"));
  assert.ok(tables.includes("HRX.dbo.GCNSeqNo_Mstr"));
  assert.ok(tables.includes("HRX.dbo.HICLSeqNo_Mstr"));
  assert.ok(tables.includes("HRX.dbo.StateDiagCodes_old"));
  assert.ok(tables.includes("HRX.dbo.step_therapy_drug"));
  assert.ok(tables.includes("HRX.dbo.step_therapy_level"));
  assert.ok(tables.includes("plandata_rx_production.dbo.claim"));
  assert.ok(tables.includes("plandata_rx_production.dbo.claimdetail"));
  assert.ok(tables.includes("plandata_rx_production.dbo.ClaimForm"));
  assert.ok(tables.includes("plandata_rx_production.dbo.authservice"));
  assert.ok(tables.includes("plandata_rx_production.dbo.enrollcoverage"));
  assert.ok(tables.includes("plandata_rx_production.dbo.referral"));
  assert.ok(tables.includes("InMemory.dbo.MEMBER_HISTORY"));
  assert.ok(tables.includes("InMemory.dbo.MEMBER"));
  assert.ok(tables.includes("InMemory.dbo.ENROLLMENT"));
  assert.ok(tables.includes("InMemory.dbo.MEMBER_ATTRIBUTE"));
  assert.ok(tables.includes("InMemory.dbo.DRUG"));
  assert.ok(tables.includes("InMemory.dbo.DRUG_ATTR"));
  assert.ok(tables.includes("InMemory.dbo.PRIOR_AUTH"));
  assert.ok(tables.includes("InMemory.dbo.EO_HISTORY"));
  assert.ok(tables.includes("InMemory.dbo.EVENT"));
  assert.ok(tables.includes("InMemory.dbo.SCHEDULEII"));
  assert.ok(tables.includes("InMemory.dbo.PROVIDER"));
  assert.ok(tables.includes("InMemory.dbo.CONTRACT_TERM"));
  assert.ok(tables.includes("InMemory.dbo.PLAN_AFFILIATIONS"));
  assert.ok(tables.includes("InMemory.dbo.BENEFITS"));
  assert.ok(tables.includes("InMemory.dbo.PARTIAL"));
  assert.ok(tables.includes("IPA.dbo.DiagCode"));
});
