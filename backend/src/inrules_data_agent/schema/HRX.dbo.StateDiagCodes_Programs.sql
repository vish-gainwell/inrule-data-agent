/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.StateDiagCodes_Programs
Primary Key from metadata: ID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[StateDiagCodes_Programs]
(
    [ID] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [DiagID] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | FK marker: X
    [DrugGroup] varchar(60) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Program_ID] varchar(20) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CoverageCode_ID] varchar(25) NULL, -- Age-based rule or restriction
    [ChangedBy] char(15) NOT NULL, -- Identifier of the user who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    CONSTRAINT [PK_StateDiagCodes_Programs] PRIMARY KEY ([ID])
);

/*
Columns marked as FK in DED workbook. Referenced tables were not available in this derived source.
- DiagID
*/
