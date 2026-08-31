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
    [GCN_SeqNo] varchar(6) NOT NULL, -- GCN Sequence Number (Clinical Formulation ID) | PK marker: X
    [HIC3] varchar(3) NULL, -- Hierarchical Specific Therapeutic Class code
    [HICL_SeqNo] varchar(6) NULL, -- Hierarchical Ingredient Code List
    [GCDF] varchar(2) NULL, -- GC Dosage Form code
    [GCRT] char(1) NULL, -- GCN Route Code; route of administration (e.g., oral, injectable, topical, etc...)
    [STR] varchar(10) NULL, -- Drug Strength Description; describes drug potency
    [GTC] varchar(2) NULL, -- Generic Therapeutic Class Code
    [TC] varchar(2) NULL, -- Therapeutic Class Code (standard)
    [DCC] char(1) NULL, -- Drug Category code
    [GCNSeq_GI] varchar(1) NULL, -- GCN Sequence Number Source Indicator; specifies single and multi-source drugs (e.g., 0: Unassigned, 1: Multiple, 2: Single)
    [Gender] varchar(1) NULL, -- Gender-Specific Drug Indicator; specifies drugs used for gender groups
    [HIC3_Seqn] varchar(6) NULL, -- Hierarchical Specific Therapeutic Class code (stable identifier)
    [STR60] varchar(60) NULL, -- Drug Strength Description; describes drug potentcy, long form
    CONSTRAINT [PK_GCNSeqNo_Mstr] PRIMARY KEY ([GCN_SeqNo])
);
