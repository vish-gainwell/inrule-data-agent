/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.ratecode_hierarchy_rx
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[ratecode_hierarchy_rx]
(
    [RX_rateid] char(15) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ratecode] char(6) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [sequence] int NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MED_rateid] char(15) NULL -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
);
