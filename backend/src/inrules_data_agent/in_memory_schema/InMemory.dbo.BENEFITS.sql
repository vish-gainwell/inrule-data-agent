/*
Logical, non-executable Rules Engine in-memory dataset derived from PlanDrugBenefitDTO.
DTO path: InRuleDTO.MemberDetails.PlanDrugBenefits
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[BENEFITS]
(
    [PlanId] nvarchar(max) NOT NULL,
    [BenefitId] nvarchar(max) NOT NULL,
    [LimitAmount] decimal(29,9) NOT NULL,
    [AgeMin] int NOT NULL,
    [AgeMax] int NOT NULL,
    [EffectiveDate] datetime2 NOT NULL,
    [TermDate] datetime2 NOT NULL
);
