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
    [DiagID] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [DrugGroup] varchar(60) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [LTC_Ind] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Class_Ind] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [BrandGeneric_Ind] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Disposition] char(4) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- Identifier of the user who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [Notes] varchar(512) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_StateDiagCodes_DrugGroup] PRIMARY KEY ([DiagID])
);
