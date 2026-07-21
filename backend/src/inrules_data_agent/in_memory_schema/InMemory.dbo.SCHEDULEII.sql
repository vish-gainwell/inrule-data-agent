/*
Logical, non-executable Rules Engine in-memory dataset derived from ScheduleIIDTO.
DTO path: InRuleDTO.MemberDetails.ScheduleIIs
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[SCHEDULEII]
(
    [ClaimId] nvarchar(max) NOT NULL,
    [MemberId] nvarchar(max) NOT NULL,
    [ProviderId] nvarchar(max) NOT NULL,
    [NDC] nvarchar(max) NOT NULL,
    [RXNumber] nvarchar(max) NOT NULL,
    [ServiceDate] datetime2 NULL,
    [PrescriptionDate] datetime2 NULL,
    [QuantityPrescribed] decimal(29,9) NULL,
    [QuantityDispensed] decimal(29,9) NULL,
    [FillsAuthorized] int NULL,
    [CreateDate] datetime2 NULL
);
