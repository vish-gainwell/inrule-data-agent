/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.MemberExclusion
Primary Key from metadata: Memid, Type, Value, EffDate, TermDate
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[MemberExclusion]
(
    [Memid] char(15) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [Type] varchar(15) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [Value] varchar(15) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive | PK marker: X
    [CreateDate] smalldatetime NOT NULL, -- Date and time the record was created
    [CreateBy] varchar(15) NOT NULL, -- Identifier of the user who created the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NOT NULL, -- Identifier of the user who changed the record
    [Notes] varchar(2000) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_MemberExclusion] PRIMARY KEY ([Memid], [Type], [Value], [EffDate], [TermDate])
);
