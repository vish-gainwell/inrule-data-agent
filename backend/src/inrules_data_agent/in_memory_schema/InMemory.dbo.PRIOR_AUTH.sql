/*
Logical, non-executable Rules Engine in-memory dataset derived from MemberPAHistoryDTO.
DTO path: InRuleDTO.MemberDetails.PAHistory
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[PRIOR_AUTH]
(
    [ReferralId] nvarchar(max) NOT NULL,
    [AuthId] bigint NOT NULL,
    [SequenceId] int NOT NULL,
    [TotalUnits] decimal(29,9) NOT NULL,
    [DaysSupply] decimal(29,9) NOT NULL,
    [UsedUnits] decimal(29,9) NOT NULL,
    [DailyDoseUnits] decimal(29,9) NOT NULL,
    [RemainingUnits] decimal(29,9) NOT NULL
);
