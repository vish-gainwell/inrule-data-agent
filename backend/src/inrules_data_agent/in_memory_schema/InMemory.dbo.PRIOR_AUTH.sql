/*
Logical, non-executable Rules Engine in-memory dataset derived from MemberPAHistoryDTO.
DTO path: InRuleDTO.MemberDetails.PAHistory
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[PRIOR_AUTH]
(
    [ReferralId] nvarchar(max) NOT NULL, -- Referral identifier
    [AuthId] bigint NOT NULL, -- Authorization identifier
    [SequenceId] int NOT NULL, -- Auth Line
    [TotalUnits] decimal(29,9) NOT NULL, -- Total Units
    [DaysSupply] decimal(29,9) NOT NULL, -- Days Supply - PA_LineItemGap.DaysSupply
    [UsedUnits] decimal(29,9) NOT NULL,
    [DailyDoseUnits] decimal(29,9) NOT NULL,
    [RemainingUnits] decimal(29,9) NOT NULL
);
