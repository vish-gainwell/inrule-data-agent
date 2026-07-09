/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.DrugOverrides
Primary Key from metadata: OverrideID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[DrugOverrides]
(
    [OverrideID] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [NDCKey] char(11) NULL, -- NDC identifier for the drug product
    [GCN_SeqNo] char(6) NULL, -- Generic code number sequence for drug grouping
    [Type] varchar(50) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- Identifier of the user who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [Notes] varchar(512) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HIC3] char(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Value] decimal(12,5) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_DrugOverrides] PRIMARY KEY ([OverrideID])
);
