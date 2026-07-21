/*
Logical, non-executable Rules Engine in-memory dataset derived from PlanAffiliationDTO.
DTO path: InRuleDTO.MemberDetails.PlanAffiliations
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[PLAN_AFFILIATIONS]
(
    [AffiliationId] nvarchar(max) NOT NULL,
    [ProviderId] nvarchar(max) NOT NULL,
    [AffiliateId] nvarchar(max) NOT NULL,
    [AffiliateType] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [PayFlag] nvarchar(max) NOT NULL,
    [EffectiveDate] datetime2 NULL,
    [TermDate] datetime2 NULL,
    [PlanProgramId] nvarchar(max) NULL,
    [PlanPCP] nvarchar(max) NULL,
    [PlanFeeId] nvarchar(max) NULL,
    [PlanEffectiveDate] datetime2 NULL,
    [PlanTermDate] datetime2 NULL,
    [ContractProgramId] nvarchar(max) NULL,
    [ContractId] nvarchar(max) NULL,
    [ContractEffectiveDate] datetime2 NULL,
    [ContractTermDate] datetime2 NULL,
    [ContractCopcTermDate] datetime2 NULL,
    [PlanProviderId] nvarchar(max) NULL,
    [ContractNetworkId] nvarchar(max) NULL,
    [ProviderEntityId] nvarchar(max) NULL,
    [AffiliateZip] nvarchar(max) NULL,
    [AffiliatePhyZip] nvarchar(max) NULL,
    [AffiliateState] nvarchar(max) NULL,
    [ServiceLocationId] nvarchar(max) NULL,
    [Contracted] bit NULL,
    [ApplyDifferential] bit NULL,
    [NetworkPayPercent] decimal(29,9) NOT NULL,
    [IsRlgExcluded] bit NULL,
    [ContractPaymentBundle] bit NULL,
    [PlanPaymentBundle] bit NULL
);
