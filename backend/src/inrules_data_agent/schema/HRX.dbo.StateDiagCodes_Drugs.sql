/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.StateDiagCodes_Drugs
Primary Key from metadata: ID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[StateDiagCodes_Drugs]
(
    [ID] int NOT NULL, -- Unique identifier for (ICD) diagnosis code line? | PK marker: X
    [DiagID] int NOT NULL, -- Diagnosis ID; specifies identifier for drug group
    [DrugGroup] varchar(60) NOT NULL, -- Short description of drug group category
    [NDCKey] char(11) NULL, -- National Drug Code identifier for drug product
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [HIC3] char(3) NULL, -- Hierarchical Specific Therapeutic Class code
    [ChangedBy] char(15) NOT NULL, -- User who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    CONSTRAINT [PK_StateDiagCodes_Drugs] PRIMARY KEY ([ID])
);

/*
Columns marked as FK in DED workbook. Referenced tables were not available in this derived source.
- DiagID
*/
