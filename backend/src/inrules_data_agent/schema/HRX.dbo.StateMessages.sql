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
    [MessageID] int NOT NULL, -- Unique identifier for message line | PK marker: X
    [NDCKey] char(11) NULL, -- National Drug Code identifier for drug product
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [HIC3] char(3) NULL, -- Hierarchical Specific Therapeutic Class code
    [Program_ID] varchar(20) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CoverageCode_ID] varchar(25) NULL, -- Coverage Code Identifier; specifies member's coverage category, benefit type, or eligibility classification
    [LTC_Ind] char(1) NULL, -- Indicator for Long Term Care
    [Class_Ind] char(1) NULL, -- Class; specifies federal prescription status (e.g., F, O, Q)
    [BrandGeneric_Ind] char(1) NULL, -- Indicator specifying whether drug is a generic
    [Message] varchar(200) NOT NULL, -- Long description comment, including bug test notations
    [Disposition] char(4) NOT NULL, -- Indicator specifying whether drug is denied or there is a warning
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- User who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [Notes] varchar(512) NULL, -- Long description comment, including bug test notations
    CONSTRAINT [PK_StateMessages] PRIMARY KEY ([MessageID])
);
