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
    [ID] int NOT NULL, -- Unique identifier for (ICD) diagnosis code line? | PK marker: X
    [DiagID] int NOT NULL, -- Diagnosis ID; specifies identifier for drug group
    [DrugGroup] varchar(60) NOT NULL, -- Short description of drug group category
    [ICDCodeID] char(8) NOT NULL, -- ICD Diagnosis Code; identifies patient conditions relevant for claims adjudication, coverage validation, or regulatory requirements
    [IcdVersion] char(1) NOT NULL, -- Indicator specifying version of ICD coding system
    [ChangedBy] char(15) NOT NULL, -- User who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    CONSTRAINT [PK_StateDiagCodes_Diags] PRIMARY KEY ([ID])
);

/*
Columns marked as FK in DED workbook. Referenced tables were not available in this derived source.
- DiagID
*/
