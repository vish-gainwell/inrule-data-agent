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
    [GCN_SeqNo] varchar(6) NOT NULL, -- GCN Sequence Number (Clinical Formulation ID) | PK marker: X
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product | PK marker: X
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [EndDate] smalldatetime NULL, -- Date when the event or update occurred.
    [PREF] char(2) NULL, -- Preferred Drug List Status; specifies if drug is preferred or not preferred
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- User who changed the record
    [PA] char(2) NULL, -- Prior Authorization Indicator
    [PDL_Status] char(3) NULL, -- Preferred Drug List Status; specifies if drug is preferred or not preferred
    CONSTRAINT [PK_NDCPrefDrug] PRIMARY KEY ([GCN_SeqNo], [NDCKey], [EffDate])
);
