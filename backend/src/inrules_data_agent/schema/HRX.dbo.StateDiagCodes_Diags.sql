/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.StateDiagCodes_Diags
Primary Key from metadata: ID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[StateDiagCodes_Diags]
(
    [ID] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [DiagID] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | FK marker: X
    [DrugGroup] varchar(60) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ICDCodeID] char(8) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [IcdVersion] char(1) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ChangedBy] char(15) NOT NULL, -- Identifier of the user who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    CONSTRAINT [PK_StateDiagCodes_Diags] PRIMARY KEY ([ID])
);

/*
Columns marked as FK in DED workbook. Referenced tables were not available in this derived source.
- DiagID
*/
