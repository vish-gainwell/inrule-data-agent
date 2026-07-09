/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.NDCPrefDrug
Primary Key from metadata: GCN_SeqNo, NDCKey, EffDate
Description: Stores National Drug Code reference, pricing, limits, or classification data.
*/

CREATE TABLE [HRX].[dbo].[NDCPrefDrug]
(
    [GCN_SeqNo] varchar(6) NOT NULL, -- Generic code number sequence for drug grouping | PK marker: X
    [NDCKey] varchar(11) NOT NULL, -- NDC identifier for the drug product | PK marker: X
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [EndDate] smalldatetime NULL, -- Date when the event or update occurred.
    [PREF] char(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- Identifier of the user who changed the record
    [PA] char(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PDL_Status] char(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_NDCPrefDrug] PRIMARY KEY ([GCN_SeqNo], [NDCKey], [EffDate])
);
