/*
Logical, non-executable Rules Engine in-memory dataset derived from MemberEOHistoryDTO.
DTO path: InRuleDTO.MemberDetails.EOHistory
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
RejectEdits exposes RejectEditDTO.EditId and is flattened with its path prefix.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[EO_HISTORY]
(
    [AuthorizationId] nvarchar(max) NOT NULL,
    [MemberId] nvarchar(max) NOT NULL,
    [CardHolderId] nvarchar(max) NOT NULL,
    [PrescriberNPI] nvarchar(max) NULL,
    [PharmacyNPI] nvarchar(max) NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [NDCKey] nvarchar(max) NOT NULL,
    [GCNSeqNo] nvarchar(max) NOT NULL,
    [Quantity] decimal(29,9) NULL,
    [DaysSupply] int NULL,
    [IT_CNT] int NOT NULL,
    [RejectEdits_EditId] nvarchar(max) NOT NULL
);
