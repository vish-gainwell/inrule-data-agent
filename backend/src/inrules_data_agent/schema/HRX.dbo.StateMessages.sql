/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.StateMessages
Primary Key from metadata: MessageID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[StateMessages]
(
    [MessageID] int NOT NULL, -- Age-based rule or restriction | PK marker: X
    [NDCKey] char(11) NULL, -- NDC identifier for the drug product
    [GCN_SeqNo] char(6) NULL, -- Generic code number sequence for drug grouping
    [HIC3] char(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Program_ID] varchar(20) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CoverageCode_ID] varchar(25) NULL, -- Age-based rule or restriction
    [LTC_Ind] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Class_Ind] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [BrandGeneric_Ind] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Message] varchar(200) NOT NULL, -- Age-based rule or restriction
    [Disposition] char(4) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- Identifier of the user who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [Notes] varchar(512) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_StateMessages] PRIMARY KEY ([MessageID])
);
