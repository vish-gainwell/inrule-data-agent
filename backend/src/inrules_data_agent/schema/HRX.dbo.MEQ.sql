/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.MEQ
Primary Key from metadata: GCN_SEQNO, HIC_SEQN
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[MEQ]
(
    [GCN_SEQNO] varchar(6) NOT NULL, -- Generic code number sequence for drug grouping | PK marker: X
    [HIC_SEQN] varchar(6) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [STRENGTH] varchar(20) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CONVFactor] decimal(10,3) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MEQ] decimal(10,2) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HIC_DESC] varchar(50) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GCRT_DESC] varchar(50) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [STRENGTH_STATUS_ CODE] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [Unit_Of_Measure] varchar(50) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DOSE_DESC] varchar(40) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DrugForm] varchar(20) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CreatedBy] varchar(20) NULL, -- Identifier of the user who created the record
    [CreateDate] datetime NULL, -- Date and time the record was created
    [ChangedBy] varchar(20) NULL, -- Identifier of the user who changed the record
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    CONSTRAINT [PK_MEQ] PRIMARY KEY ([GCN_SEQNO], [HIC_SEQN])
);
