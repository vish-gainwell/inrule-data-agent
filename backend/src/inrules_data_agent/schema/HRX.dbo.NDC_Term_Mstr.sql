/*
Authoritative schema from verified live SQL Server metadata.
Database: HRX
Table: dbo.NDC_Term_Mstr
*/
CREATE TABLE [HRX].[dbo].[NDC_Term_Mstr]
(
    [NDCKey] char(11) NOT NULL,
    [Source] char(1) NULL,
    [TermDate] datetime NULL,
    [EffDate] smalldatetime NOT NULL,
    [EndDate] smalldatetime NOT NULL,
    [GCN_SeqNo] char(6) NULL,
    [HICL_SeqNo] char(6) NULL,
    [CreateDate] datetime NOT NULL,
    [CreatedBY] char(15) NOT NULL,
    [ChangedDate] datetime NOT NULL,
    [ChangedBy] char(15) NOT NULL,
    [Flag] char(2) NULL,
    [ReactivationDate] smalldatetime NULL
);
