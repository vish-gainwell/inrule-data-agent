/*
Logical, non-executable Rules Engine in-memory dataset derived from PlanAffiliationDTO.
DTO path: InRuleDTO.MemberDetails.PlanAffiliations
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[PLAN_AFFILIATIONS]
(
    [AffiliationId] nvarchar(max) NOT NULL, -- Affiliation ID
    [ProviderId] nvarchar(max) NOT NULL, -- Provider ID
    [AffiliateId] nvarchar(max) NOT NULL, -- Affiliate ID
    [AffiliateType] nvarchar(max) NOT NULL, -- Affiliate Type
    [Status] nvarchar(max) NOT NULL, -- Status of the affiliation
    [PayFlag] nvarchar(max) NOT NULL, -- Pay Flag
    [EffectiveDate] datetime2 NULL, -- Effective Date of the affiliation
    [TermDate] datetime2 NULL, -- Termination Date of the affiliation
    [PlanProgramId] nvarchar(max) NULL, -- Plan Program ID
    [PlanPCP] nvarchar(max) NULL, -- Plan PCP
    [PlanFeeId] nvarchar(max) NULL, -- Plan Fee ID
    [PlanEffectiveDate] datetime2 NULL, -- Plan Effective Date
    [PlanTermDate] datetime2 NULL, -- Plan Termination Date
    [ContractProgramId] nvarchar(max) NULL, -- Contract Program ID
    [ContractId] nvarchar(max) NULL, -- Contract ID
    [ContractEffectiveDate] datetime2 NULL, -- Contract Effective Date
    [ContractTermDate] datetime2 NULL, -- Contract Termination Date
    [ContractCopcTermDate] datetime2 NULL, -- Contract COPC Term Date
    [PlanProviderId] nvarchar(max) NULL, -- Plan Provider ID
    [ContractNetworkId] nvarchar(max) NULL, -- Contract Network ID
    [ProviderEntityId] nvarchar(max) NULL, -- Provider Entity ID
    [AffiliateZip] nvarchar(max) NULL, -- Affiliate Zip
    [AffiliatePhyZip] nvarchar(max) NULL, -- Affiliate Phy Zip
    [AffiliateState] nvarchar(max) NULL, -- Affiliate State
    [ServiceLocationId] nvarchar(max) NULL, -- Service Location ID
    [Contracted] bit NULL, -- Contracted
    [ApplyDifferential] bit NULL, -- Apply Differential
    [NetworkPayPercent] decimal(29,9) NOT NULL, -- Network Pay Percent
    [IsRlgExcluded] bit NULL, -- Is RLG Excluded
    [ContractPaymentBundle] bit NULL, -- Contract Payment Bundle
    [PlanPaymentBundle] bit NULL -- Plan Payment Bundle
);
