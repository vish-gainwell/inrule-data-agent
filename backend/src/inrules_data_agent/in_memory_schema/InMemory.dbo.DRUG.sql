/*
Logical, non-executable Rules Engine in-memory dataset derived from DrugRequestedDTO.

DTO path: InRuleDTO.ClaimRequest.DrugRequested
Mapping authority: IR_DTO_schema.xlsx (DTO Metadata and Memory Tables),
dto_tree.txt, and total_tree.txt.

DrugRequestedDTO exposes only nested drug-code DTOs in the authorities. Their
explicit properties are flattened with path prefixes. This is not a physical SQL
Server table. SQL types preserve workbook C# types/nullability; unspecified string
lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[DRUG]
(
    [NDC_Code] nvarchar(max) NOT NULL,
    [NDC_LabelName] nvarchar(max) NULL,
    [NDC_Strength] nvarchar(max) NULL,
    [NDC_Route] nvarchar(max) NULL,
    [NDC_Dose] nvarchar(max) NULL,
    [NDC_PDLStatus] nvarchar(max) NULL,
    [NDC_IsPayable] bit NOT NULL,
    [NDC_IsBrand] bit NOT NULL,
    [NDC_IsPreferred] bit NOT NULL,
    [NDC_IsNonPreferred] bit NOT NULL,
    [NDC_IsGeneric] bit NOT NULL,
    [NDC_PrefDrug_PREF] nvarchar(max) NULL,
    [NDC_PARequired] bit NOT NULL,
    [NDC_MinDayDose] decimal(29,9) NULL,
    [NDC_MaxDayDose] decimal(29,9) NULL,
    [NDC_MaxRefills] int NOT NULL,
    [NDC_MaxRxDays] int NOT NULL,
    [NDC_MaxRxUnits] decimal(29,9) NOT NULL,
    [NDC_AttrMaxRxUnits] decimal(29,9) NOT NULL,
    [NDC_FGenCode] smallint NOT NULL,
    [NDC_HGenCode] smallint NOT NULL,
    [NDC_LastCovidDoseCount] int NOT NULL,
    [NDC_CovidEffDate] datetime2 NULL,
    [NDC_CovidTermDate] datetime2 NULL,
    [NDC_Ps] nvarchar(max) NULL,
    [NDC_Gni] nvarchar(max) NULL,
    [NDC_Dea] int NOT NULL,
    [NDC_AddNotActive] datetime2 NULL,
    [NDC_DisableAllPlans] datetime2 NULL,
    [NDC_Cl] nvarchar(max) NULL,
    [NDC_Gpi] nvarchar(max) NULL,
    [NDC_Ndcgi1] nvarchar(max) NULL,
    [NDC_HcfaTrmc] datetime2 NULL,
    [NDC_Repndc] nvarchar(max) NULL,
    [NDC_SetGender] nvarchar(max) NULL,
    [NDC_Pd] nvarchar(max) NULL,
    [NDC_Ud] nvarchar(max) NULL,
    [NDC_Df] nvarchar(max) NULL,
    [NDC_HcfaDesi1] nvarchar(max) NULL,
    [NDC_Desi] nvarchar(max) NULL,
    [NDC_Desi2] nvarchar(max) NULL,
    [NDC_Ln] nvarchar(max) NULL,
    [NDC_Bn] nvarchar(max) NULL,
    [NDC_HcfaTyp] nvarchar(max) NULL,
    [NDC_Pkgbilling] nvarchar(max) NULL,
    [NDC_Maxscriptdays] int NOT NULL,
    [NDC_MinAge] int NULL,
    [NDC_MaxAge] int NULL,
    [NDC_DaysTillRefill] int NOT NULL,
    [NDC_AttrDaysTillRefill] int NOT NULL,
    [GCNSeqNo_Code] nvarchar(max) NULL,
    [GCNSeqNo_Description] nvarchar(max) NULL,
    [HIC3_Code] nvarchar(max) NULL,
    [HIC3_Description] nvarchar(max) NULL,
    [HICLSeqNo_Code] nvarchar(max) NULL,
    [HICLSeqNo_Description] nvarchar(max) NULL,
    [GCN_Code] nvarchar(max) NULL,
    [GCN_Description] nvarchar(max) NULL
);
