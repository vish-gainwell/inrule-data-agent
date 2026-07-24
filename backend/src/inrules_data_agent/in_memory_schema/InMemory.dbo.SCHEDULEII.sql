/*
Logical, non-executable Rules Engine in-memory dataset derived from ScheduleIIDTO.
DTO path: InRuleDTO.MemberDetails.ScheduleIIs
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[SCHEDULEII]
(
    [ClaimId] nvarchar(max) NOT NULL, -- Represents Claim Id
    [MemberId] nvarchar(max) NOT NULL, -- Represents unique Identification of member
    [ProviderId] nvarchar(max) NOT NULL, -- Represents unique Identification of provider
    [NDC] nvarchar(max) NOT NULL, -- Represents NDC Key
    [RXNumber] nvarchar(max) NOT NULL, -- Represents Rx Number
    [ServiceDate] datetime2 NULL, -- Represents Date Of Service
    [PrescriptionDate] datetime2 NULL, -- Represents Date Of Service Written
    [QuantityPrescribed] decimal(29,9) NULL, -- Represents Prescribed Quantity
    [QuantityDispensed] decimal(29,9) NULL, -- Represents Quantity Dispensed
    [FillsAuthorized] int NULL, -- Represents Authorized Fills
    [CreateDate] datetime2 NULL -- Represents Created Date
);
