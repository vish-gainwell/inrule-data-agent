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
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[DRUG_ATTR]
(
    [NDC_Code] nvarchar(max) NOT NULL, -- Ndc code
    [NDC_LabelName] nvarchar(max) NULL, -- Ndc label name
    [NDC_Strength] nvarchar(max) NULL, -- Strength
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
    [GCNSeqNo_Code] nvarchar(max) NULL, -- GCN seq code
    [GCNSeqNo_Description] nvarchar(max) NULL, -- Description for gcn seq code
    [HIC3_Code] nvarchar(max) NULL, -- Hic3 code
    [HIC3_Description] nvarchar(max) NULL, -- Hic3 description
    [HICLSeqNo_Code] nvarchar(max) NULL, -- Hicl code
    [HICLSeqNo_Description] nvarchar(max) NULL, -- Hicl description
    [GCN_Code] nvarchar(max) NULL, -- GCN code
    [GCN_Description] nvarchar(max) NULL -- Description for gcn code
);
