/*
Logical, non-executable Rules Engine in-memory dataset derived from ContractTermDTO.
DTO path: InRuleDTO.ClaimRequest.ContractTerms
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[CONTRACT_TERM]
(
    [ContractId] nvarchar(max) NOT NULL,
    [TermId] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [ProvType] nvarchar(max) NOT NULL,
    [EffDate] datetime2 NOT NULL,
    [TermDate] datetime2 NOT NULL
);
