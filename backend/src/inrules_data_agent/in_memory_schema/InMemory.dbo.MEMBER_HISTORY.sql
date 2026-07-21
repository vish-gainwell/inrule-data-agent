/*
Logical Rules Engine in-memory dataset generated from ClaimDTO.

Runtime path: InRuleDTO.MemberDetails.ClaimHistory
Loader: plandata_rx_production.dbo.hrxMemberHistory_NJ
Physical sources:
  - plandata_rx_production.dbo.claim
  - plandata_rx_production.dbo.claimpharm

This is not a physical SQL Server table and must not be executed through
/execute_query. String lengths and decimal scales are not specified by the DTO;
the SQL-like types below represent the C# property types only.
*/
CREATE TABLE [InMemory].[dbo].[MEMBER_HISTORY]
(
    [ClaimID] nvarchar(max) NULL,
    [DrugName] nvarchar(max) NULL,
    [DrugGenClass] nvarchar(max) NULL,
    [GCNSeqNo] nvarchar(max) NULL,
    [GCN] nvarchar(max) NULL,
    [HICLSeqNo] nvarchar(max) NULL,
    [NDC] nvarchar(max) NULL,
    [RxDate] nvarchar(max) NULL,
    [DateOfService] nvarchar(max) NULL,
    [Quantity] decimal(29,9) NOT NULL,
    [DaysSupply] int NOT NULL,
    [PrescriberNPI] nvarchar(max) NULL,
    [ProviderNPI] nvarchar(max) NULL,
    [PharmacyNPI] nvarchar(max) NULL,
    [PDLStatus] nvarchar(max) NULL,
    [PrefDrug_PREF] nvarchar(max) NULL,
    [PARequired] bit NOT NULL,
    [Dose] float(53) NOT NULL,
    [IsGeneric] bit NOT NULL,
    [NewRefill] int NOT NULL,
    [IsNewRefill] bit NOT NULL,
    [IsBrand] bit NOT NULL,
    [IsPreferred] bit NOT NULL,
    [PlanId] nvarchar(max) NULL,
    [CompoundIndicator] int NULL,
    [ProviderId] nvarchar(max) NULL,
    [MemberId] nvarchar(max) NULL,
    [ExhaustedDate] nvarchar(max) NULL,
    [RxNumber] nvarchar(max) NULL,
    [NdcCode] nvarchar(max) NULL,
    [PrescriberNbr] nvarchar(max) NULL,
    [FillDate] nvarchar(max) NULL,
    [Fill_Date] nvarchar(max) NULL,
    [VacationRefillDate] datetime2 NOT NULL,
    [CertificationNumber] nvarchar(max) NULL,
    [TherapeuticClass] nvarchar(max) NULL,
    [DispensingFee] decimal(29,9) NULL,
    [RxDateOfService] datetime2 NOT NULL,
    [CreateDate] datetime2 NOT NULL,
    [TotalMemberAmount] decimal(29,9) NULL,
    [ExternalClaimId] nvarchar(max) NULL,
    [RxDateWritten] nvarchar(max) NULL,
    [IsEncounter] bit NOT NULL,
    [PriorAuth] nvarchar(max) NULL,
    [Dosage] decimal(29,9) NULL,
    [PaidDate] datetime2 NULL,
    [FormType] nvarchar(max) NULL
);
