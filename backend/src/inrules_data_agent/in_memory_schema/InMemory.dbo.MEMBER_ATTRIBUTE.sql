/*
Logical, non-executable Rules Engine in-memory dataset derived from MemberDetailsDTO
(MemberDTO base).

DTO path: InRuleDTO.MemberDetails
Mapping authority: IR_DTO_schema.xlsx (DTO Metadata and Memory Tables),
dto_tree.txt, and total_tree.txt.

AddressDTO is explicitly expanded by the DTO tree, so its properties are flattened
with an Address_ prefix. This is not a physical SQL Server table and must not be
executed through /execute_query. SQL types preserve workbook C# types/nullability;
unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[MEMBER_ATTRIBUTE]
(
    [MemberID] nvarchar(max) NULL,
    [CardholderID] nvarchar(max) NULL,
    [FirstName] nvarchar(max) NULL,
    [LastName] nvarchar(max) NULL,
    [BirthDate] date NULL,
    [DeathDate] date NULL,
    [Gender] nvarchar(max) NULL,
    [Phone] nvarchar(max) NULL,
    [AgeInMonths] int NOT NULL,
    [AgeInYears] int NOT NULL,
    [Address_Id] int NOT NULL,
    [Address_Address1] nvarchar(max) NULL,
    [Address_Address2] nvarchar(max) NULL,
    [Address_City] nvarchar(max) NULL,
    [Address_StateProvince] nvarchar(max) NULL,
    [Address_PostalCode] nvarchar(max) NULL,
    [Address_CountryCode] nvarchar(max) NULL,
    [IsInLTC] bit NULL,
    [EthnicID] nvarchar(max) NULL
);
