/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.NDCPriceHistory
Primary Key from metadata: NDCKey, PriceGroupID, NPT_Type, EffDate
Description: Stores National Drug Code reference, pricing, limits, or classification data.
*/

CREATE TABLE [HRX].[dbo].[NDCPriceHistory]
(
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product | PK marker: X
    [PriceGroupID] varchar(4) NOT NULL, -- Price Group Identifier; specifies pricing policy group | PK marker: X
    [NPT_Type] varchar(2) NOT NULL, -- NDC Price Table Type Code; identifies price type of a given NDC | PK marker: X
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [Price] decimal(12,5) NULL, -- Pricing or reimbursement value
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- User who changed the record
    [Source] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_NDCPriceHistory] PRIMARY KEY ([NDCKey], [PriceGroupID], [NPT_Type], [EffDate])
);
