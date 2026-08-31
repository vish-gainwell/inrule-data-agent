/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.HICLSeqNo_Mstr
Primary Key from metadata: HICL_SeqNo
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[HICLSeqNo_Mstr]
(
    [HICL_SeqNo] varchar(6) NOT NULL, -- Hierarchical Ingredient Code List | PK marker: X
    [GNN] varchar(30) NULL, -- Generic Name, short form
    [GNN60] varchar(60) NULL, -- Generic Name, long form
    CONSTRAINT [PK_HICLSeqNo_Mstr] PRIMARY KEY ([HICL_SeqNo])
);
