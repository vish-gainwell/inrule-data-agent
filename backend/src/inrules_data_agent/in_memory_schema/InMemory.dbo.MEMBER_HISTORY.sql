/*
Logical, non-executable Rules Engine in-memory dataset derived from ClaimDTO.

DTO path: InRuleDTO.MemberDetails.ClaimHistory
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.

This is not a physical SQL Server table and must not be executed through
/execute_query. String lengths and decimal scales are not specified by the DTO;
the SQL-like types below represent the C# property types only.
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[MEMBER_HISTORY]
(
    [ClaimID] nvarchar(max) NULL, -- Unique claim id
    [DrugName] nvarchar(max) NULL, -- Drug name
    [DrugGenClass] nvarchar(max) NULL, -- DrugGenClass represents the general class of a drug
    [GCNSeqNo] nvarchar(max) NULL, -- GCN seq number
    [GCN] nvarchar(max) NULL,
    [HICLSeqNo] nvarchar(max) NULL,
    [NDC] nvarchar(max) NULL, -- NDC
    [RxDate] nvarchar(max) NULL, -- Rx Date
    [DateOfService] nvarchar(max) NULL, -- Rx Date
    [Quantity] decimal(29,9) NOT NULL, -- MetricQuantity represents a numerical value representing a drug quantity
    [DaysSupply] int NOT NULL, -- DaysSupply represents the days’ supply number for the medication being dispensed.
    [PrescriberNPI] nvarchar(max) NULL, -- PrescriberNPI represents the National Provider Identifier of the prescriber.
    [ProviderNPI] nvarchar(max) NULL, -- ProviderNPI represents the National Provider Identifier (NPI) of a healthcare provider.
    [PharmacyNPI] nvarchar(max) NULL, -- PharmacyNPI represents the National Provider Identifier of the Pharmacy.
    [PDLStatus] nvarchar(max) NULL, -- PDLStatus represents the status of a drug on a Preferred Drug List (PDL), indicating whether it is preferred, non-preferred, or otherwise categorized.
    [PrefDrug_PREF] nvarchar(max) NULL,
    [PARequired] bit NOT NULL,
    [Dose] float(53) NOT NULL, -- Dose
    [IsGeneric] bit NOT NULL, -- Represents IsGeneric
    [NewRefill] int NOT NULL, -- NewRefill represents Refill value.
    [IsNewRefill] bit NOT NULL, -- Represents IsNewRefill
    [IsBrand] bit NOT NULL, -- Represents IsBrand
    [IsPreferred] bit NOT NULL, -- Represents IsPreferred
    [PlanId] nvarchar(max) NULL, -- Represents Claim plan id
    [CompoundIndicator] int NULL, -- Represents whether the claim is a compound medication.
    [ProviderId] nvarchar(max) NULL, -- Represents the provider identifier associated with the claim.
    [MemberId] nvarchar(max) NULL, -- Represents the member identifier associated with the claim.
    [ExhaustedDate] nvarchar(max) NULL, -- Represents the date when the claim was exhausted.
    [RxNumber] nvarchar(max) NULL, -- Represents the prescription number associated with the claim.
    [NdcCode] nvarchar(max) NULL, -- Represents the National Drug Code (NDC) for the medication.
    [PrescriberNbr] nvarchar(max) NULL, -- Represents the prescriber number associated with the claim.
    [FillDate] nvarchar(max) NULL, -- MM/dd/ccyy Represents the date when the medication was filled.
    [Fill_Date] nvarchar(max) NULL, -- ccyymmdd Represents the date when the medication was filled.
    [VacationRefillDate] datetime2 NOT NULL, -- Represents the date for vacation refill.
    [CertificationNumber] nvarchar(max) NULL, -- Represents the certification number for the claim.
    [TherapeuticClass] nvarchar(max) NULL, -- Represents the therapeutic class of the medication.
    [DispensingFee] decimal(29,9) NULL, -- Represents the dispensing fee associated with the claim.
    [RxDateOfService] datetime2 NOT NULL, -- Represents the date of service for the claim.
    [CreateDate] datetime2 NOT NULL, -- Represents the creation date of the claim.
    [TotalMemberAmount] decimal(29,9) NULL, -- Represents the total member amount associated with the claim.
    [ExternalClaimId] nvarchar(max) NULL, -- Represents the external claim identifier.
    [RxDateWritten] nvarchar(max) NULL, -- Represents the date when the prescription was written.
    [IsEncounter] bit NOT NULL, -- Represents whether the claim is an encounter.
    [PriorAuth] nvarchar(max) NULL, -- Represents the prior authorization status for the claim.
    [Dosage] decimal(29,9) NULL,
    [PaidDate] datetime2 NULL,
    [FormType] nvarchar(max) NULL
);
