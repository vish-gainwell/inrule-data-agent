/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.NDC_Mstr
Primary Key from metadata: NDCKey
Description: Stores National Drug Code reference, pricing, limits, or classification data.
*/

CREATE TABLE [HRX].[dbo].[NDC_Mstr]
(
    [NDCKey] varchar(11) NOT NULL, -- NDC identifier for the drug product | PK marker: X
    [LBLRID] varchar(6) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GCN_SeqNo] varchar(6) NOT NULL, -- Generic code number sequence for drug grouping
    [PS] varchar(12) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DF] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [AD] varchar(20) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [LN] varchar(30) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [BN] varchar(30) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PNDC] varchar(11) NULL, -- NDC identifier for the drug product
    [REPNDC] varchar(11) NULL, -- NDC identifier for the drug product
    [NDCFI] varchar(1) NULL, -- NDC identifier for the drug product
    [DADDNC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DUPDC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DESI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DESDTEC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DESI2] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DESI2DTEC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DEA] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CL] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GPI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HOSP] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [INNOV] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [IPI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MINI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MAINT] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [OBC] varchar(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [OBSDTEC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PPI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [STPK] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [REPACK] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [TOP200] varchar(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [UD] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CSP] varchar(7) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [NDL_GDGE] decimal(6,3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [NDL_LNGTH] decimal(6,3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [SYR_CPCTY] decimal(6,3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [SHLF_PCK] varchar(7) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [SHIPPER] varchar(7) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_FDA] varchar(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_UNIT] varchar(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_PS] decimal(12,3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_APPC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_MRKC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_TRMC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_TYP] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_DESC1] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HCFA_DESI1] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [UU] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PD] varchar(10) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [LN25] varchar(25) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [LN25I] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GPIDC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [BBDC] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [HOME] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [INPCKI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [OUTPCKI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [OBC_EXP] varchar(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PS_EQUIV] decimal(12,3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PLBLR] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [TOP50GEN] varchar(2) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [OBC3] varchar(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GMI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GNI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GSI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GTI] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [NDCGI1] varchar(1) NULL, -- NDC identifier for the drug product
    [HCFA_DC] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DPU_REPNDC] varchar(11) NULL, -- NDC identifier for the drug product
    [Disable_All_Plans] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MinAge] varchar(3) NULL, -- Age-based rule or restriction
    [MaxAge] varchar(3) NULL, -- Age-based rule or restriction
    [SetGender] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [AddNotActive] smalldatetime NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MinDayDose] varchar(8) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MaxDayDose] varchar(8) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MaxRefills] varchar(4) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MaxRxDays] varchar(4) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [MaxRxUnits] varchar(11) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DaysTillRefill] varchar(4) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [H_GEN_Code] smallint NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PA] smallint NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [F_GEN_Code] smallint NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- Identifier of the user who changed the record
    [PKGBILLING] char(1) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [stateschedule] varchar(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [maxscriptdays] varchar(3) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ReactivationDate] smalldatetime NULL, -- Date when the event or update occurred
    [LN60] varchar(60) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    CONSTRAINT [PK_NDC_Mstr] PRIMARY KEY ([NDCKey])
);
