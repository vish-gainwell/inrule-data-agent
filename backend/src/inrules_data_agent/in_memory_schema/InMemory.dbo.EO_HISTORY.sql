/*
Logical, non-executable Rules Engine in-memory dataset derived from MemberEOHistoryDTO.
DTO path: InRuleDTO.MemberDetails.EOHistory
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
RejectEdits exposes RejectEditDTO.EditId and is flattened with its path prefix.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[EO_HISTORY]
(
    [AuthorizationId] nvarchar(max) NOT NULL, -- Authorization indentifier - (Referral Id)
    [MemberId] nvarchar(max) NOT NULL, -- Member identifier
    [CardHolderId] nvarchar(max) NOT NULL, -- CardHolderId identifier
    [PrescriberNPI] nvarchar(max) NULL, -- Prescriber NPI number
    [PharmacyNPI] nvarchar(max) NULL, -- Pharmacy NPI number (Provider)
    [StartDate] datetime2 NOT NULL, -- Date when prior auth will be effective from
    [EndDate] datetime2 NOT NULL, -- Date till which prior auth will be effective
    [Status] nvarchar(max) NOT NULL, -- Status of prior auth
    [NDCKey] nvarchar(max) NOT NULL, -- National drug code key
    [GCNSeqNo] nvarchar(max) NOT NULL, -- GCN Sequence Number
    [Quantity] decimal(29,9) NULL, -- Total Units - PA_Gap
    [DaysSupply] int NULL, -- Days supply
    [IT_CNT] int NOT NULL, -- Gets or sets the item count.
    [RejectEdits_EditId] nvarchar(max) NOT NULL
);
