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
    [GCN_SEQNO] varchar(6) NOT NULL, -- GCN Sequence Number (Clinical Formulation ID) | PK marker: X
    [HIC_SEQN] varchar(6) NOT NULL, -- Hierarchical Ingredient Code Sequence Number | PK marker: X
    [STRENGTH] varchar(20) NOT NULL, -- Drug Strength; provides strength of active ingredient contained in drug product
    [CONVFactor] decimal(10,3) NOT NULL, -- Morphine Equivalent Conversion Factor used to convert drug strength into MEQ
    [MEQ] decimal(10,2) NOT NULL, -- Morphine Equivalent Quantity; used to standardize opiod potency
    [HIC_DESC] varchar(50) NULL, -- Hierarchical Ingredient Code description
    [GCRT_DESC] varchar(50) NULL, -- GCN Route Code description
    [STRENGTH_STATUS_ CODE] char(1) NULL, -- Ingredient Strength Status Code; specifies status of an ingredient (e.g., 1: Not Specified, 2: Specified, 3: Trace)
    [Unit_Of_Measure] varchar(50) NULL, -- Unit of Measure used to express drug strength
    [DOSE_DESC] varchar(40) NULL, -- Short description of dose form type
    [DrugForm] varchar(20) NULL, -- Drug Form code description
    [CreatedBy] varchar(20) NULL, -- User who created the record
    [CreateDate] datetime NULL, -- Date and time the record was created
    [ChangedBy] varchar(20) NULL, -- User who changed the record
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    CONSTRAINT [PK_MEQ] PRIMARY KEY ([GCN_SEQNO], [HIC_SEQN])
);
