/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.prescribrExclusion
Primary Key from metadata: NPI, EffDate
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[prescribrExclusion]
(
    [NPI] char(10) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [DEA] char(9) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [LastName] varchar(60) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [FirstName] varchar(35) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [BusinessName] varchar(95) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [EffDate] datetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [EndDate] datetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- Identifier of the user who changed the record
    [CreateDate] datetime NOT NULL, -- Date and time the record was created
    [UpdateDate] datetime NOT NULL, -- Date and time the record was updated
    [Notes] varchar(2000) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_prescribrExclusion] PRIMARY KEY ([NPI], [EffDate])
);
