CREATE TABLE [HRX].[dbo].[StateDiagCodes_old]
(
    [DiagID] int NOT NULL,
    [ICDCodeid] char(8) NOT NULL,
    [IcdVersion] char(1) NOT NULL,
    [NDCKey] char(11) NULL,
    [GCN_SeqNo] char(6) NULL,
    [HIC3] char(3) NULL,
    [Program_ID] varchar(20) NOT NULL,
    [CoverageCode_ID] varchar(25) NULL,
    [LTC_Ind] char(1) NULL,
    [Class_Ind] char(1) NULL,
    [BrandGeneric_Ind] char(1) NULL,
    [Disposition] char(4) NOT NULL,
    [EffDate] smalldatetime NOT NULL,
    [TermDate] smalldatetime NOT NULL,
    [ChangedBy] char(15) NOT NULL,
    [ChangedDate] smalldatetime NOT NULL,
    [Notes] varchar(512) NULL
);
