/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.GCNSeqNo_Mstr
Primary Key from metadata: GCN_SeqNo
Description: Stores Generic Code Number mappings, drug grouping, or therapeutic class information.
*/

CREATE TABLE [HRX].[dbo].[GCNSeqNo_Mstr]
(
    [GCN_SeqNo] varchar(6) NOT NULL, -- Generic code number sequence for drug grouping | PK marker: X
    [HIC3] varchar(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HICL_SeqNo] varchar(6) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GCDF] varchar(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GCRT] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [STR] varchar(10) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GTC] varchar(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [TC] varchar(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DCC] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GCNSeq_GI] varchar(1) NULL, -- Generic code number sequence for drug grouping
    [Gender] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HIC3_Seqn] varchar(6) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [STR60] varchar(60) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_GCNSeqNo_Mstr] PRIMARY KEY ([GCN_SeqNo])
);
