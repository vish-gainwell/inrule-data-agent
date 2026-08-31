/*
Authoritative schema with curated DED descriptions.
Description: Stores drug-specific override rules that supersede standard adjudication, coverage, or utilization-management logic based on NDC, GCN, or therapeutic class.
*/

CREATE TABLE [HRX].[dbo].[DrugOverrides]
(
    [OverrideID] int NOT NULL, -- Unique identifier for override line | PK marker: X
    [NDCKey] char(11) NULL, -- National Drug Code identifier for drug product
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [Type] varchar(50) NOT NULL, -- Drug override type
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- User who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [Notes] varchar(512) NULL, -- Long description comment, including reason for override and other notations
    [HIC3] char(3) NULL, -- Hierarchical Specific Therapeutic Class code
    [Value] decimal(12,5) NULL, -- The parameter value of corresponding drug override type.
    CONSTRAINT [PK_DrugOverrides] PRIMARY KEY ([OverrideID])
);
