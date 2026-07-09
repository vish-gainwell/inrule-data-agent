/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.prescriberAllowed
Primary Key from metadata: ID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[prescriberAllowed]
(
    [ID] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [NPI] char(10) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DEA] char(9) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DrugTypeAllowed] varchar(50) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [EffDate] datetime NOT NULL, -- Date and time the record becomes effective
    [EndDate] datetime NOT NULL, -- Date when the event or update occurred.
    [ChangedBy] char(15) NOT NULL, -- Identifier of the user who changed the record
    [ChangedDate] datetime NOT NULL, -- Date and time the record was changed
    [CreateDate] datetime NOT NULL, -- Date and time the record was created
    CONSTRAINT [PK_prescriberAllowed] PRIMARY KEY ([ID])
);
