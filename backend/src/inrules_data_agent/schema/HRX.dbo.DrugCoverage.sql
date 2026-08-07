/*
Authoritative schema with curated DED descriptions.
Description: Defines drug coverage eligibility by NDC and plan, establishing which products are covered under specific benefit plans and during what effective periods.
*/
CREATE TABLE [HRX].[dbo].[DrugCoverage]
(
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product
    [Planid] char(15) NOT NULL, -- Unique Identifier for Plan
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [CreatedBy] varchar(120) NOT NULL, -- Identifier of the user who created the record
    [CreateDate] datetime NOT NULL, -- Date and time the record was created
    [ChangedBy] varchar(120) NOT NULL, -- User who changed the record
    [ChangedDate] datetime NOT NULL -- Date and time the record was changed
);
