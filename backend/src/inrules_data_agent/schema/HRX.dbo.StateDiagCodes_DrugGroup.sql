/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.StateDiagCodes_DrugGroup
Primary Key from metadata: DiagID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[StateDiagCodes_DrugGroup]
(
    [DiagID] int NOT NULL, -- Diagnosis ID; specifies identifier for drug group | PK marker: X
    [DrugGroup] varchar(60) NOT NULL, -- Short description of drug group category
    [LTC_Ind] char(1) NULL, -- Indicator for Long Term Care
    [Class_Ind] char(1) NULL, -- Class; specifies federal prescription status (e.g., F, O, Q)
    [BrandGeneric_Ind] char(1) NULL, -- Indicator specifying whether drug is a generic
    [Disposition] char(4) NOT NULL, -- Indicator specifying whether drug is denied or there is a warning
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- User who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [Notes] varchar(512) NULL, -- Long description comment
    CONSTRAINT [PK_StateDiagCodes_DrugGroup] PRIMARY KEY ([DiagID])
);
