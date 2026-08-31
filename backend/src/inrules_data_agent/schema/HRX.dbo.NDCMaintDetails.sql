CREATE TABLE [HRX].[dbo].[NDCMaintDetails]
(
    [Planid] varchar(15) NOT NULL,
    [EffDate] smalldatetime NOT NULL,
    [NDCKey] char(11) NOT NULL,
    [GCN_SeqNo] char(6) NOT NULL,
    [TC] char(3) NOT NULL,
    [TermDate] smalldatetime NOT NULL,
    [Type] char(8) NULL,
    [MinAge] varchar(4) NULL,
    [MaxAge] varchar(4) NULL,
    [Gender] varchar(1) NULL,
    [MinDayDose] varchar(15) NULL,
    [MaxDayDose] varchar(15) NULL,
    [MaxRefills] varchar(5) NULL,
    [MaxRxDays] varchar(5) NULL,
    [MaxRxUnits] varchar(11) NULL,
    [DaysTillRefill] varchar(5) NULL,
    [ChangedDate] smalldatetime NULL,
    [ChangedBy] varchar(15) NULL,
    [Class_Ind] char(1) NULL,
    [PKGBILLING] char(1) NULL,
    CONSTRAINT [PK_NDCMaintDetails] PRIMARY KEY
        ([Planid], [EffDate], [NDCKey], [GCN_SeqNo], [TC])
);

-- Reviewed semantics:
-- * Plan-specific drug-maintenance limits are active when DateOfService is inclusively
--   between EffDate and TermDate.
-- * Match specificity is exact NDCKey, then GCN_SeqNo, then TC when the business
--   meaning permits all three paths.
-- * This table does not contain MaxScriptDays. That physical column belongs to
--   HRX.dbo.NDC_Mstr; never invent NDCMaintDetails.MaxScriptDays.
