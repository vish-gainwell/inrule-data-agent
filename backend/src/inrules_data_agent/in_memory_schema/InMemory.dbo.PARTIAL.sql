/*
Logical, non-executable Rules Engine in-memory dataset derived from PartialHistoryDTO.
DTO path: InRuleDTO.MemberDetails.PartialClaimHistory
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[PARTIAL]
(
    [ClaimId] nvarchar(max) NOT NULL,
    [Provid] nvarchar(max) NOT NULL,
    [MemId] nvarchar(max) NOT NULL,
    [RxNumber] nvarchar(max) NOT NULL,
    [NewRefill] nvarchar(max) NOT NULL,
    [MetricQty] nvarchar(max) NOT NULL,
    [DaysSupply] nvarchar(max) NOT NULL,
    [Ndc] nvarchar(max) NOT NULL,
    [RxDate] datetime2 NULL,
    [GCN] nvarchar(max) NOT NULL,
    [GCN_SeqNo] nvarchar(max) NOT NULL,
    [TherapeuticClass] nvarchar(max) NOT NULL,
    [Dos] datetime2 NULL,
    [RxDateWritten] datetime2 NULL,
    [CertificationMbr] nvarchar(max) NOT NULL,
    [MatchingClaimId] nvarchar(max) NOT NULL,
    [DispensingStatus] nvarchar(max) NOT NULL,
    [IntendedQuantityToBeDispensed] decimal(29,9) NOT NULL,
    [IntendedDaysSupply] int NOT NULL,
    [AssociatedPrescriptionRefNumber] nvarchar(max) NOT NULL,
    [AssociatedDateOfService] datetime2 NOT NULL
);
