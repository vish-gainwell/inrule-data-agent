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
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[MEMBER_ATTRIBUTE]
(
    [MemberID] nvarchar(max) NULL, -- Unique member id
    [CardholderID] nvarchar(max) NULL, -- Card holder id
    [FirstName] nvarchar(max) NULL, -- First name of member
    [LastName] nvarchar(max) NULL, -- Last name of member
    [BirthDate] date NULL, -- DOB of member
    [DeathDate] date NULL, -- Date of Death of member
    [Gender] nvarchar(max) NULL, -- Gender of member
    [Phone] nvarchar(max) NULL, -- Phone number of member
    [AgeInMonths] int NOT NULL, -- Member's age in months
    [AgeInYears] int NOT NULL, -- Member's age in years
    [Address_Id] int NOT NULL, -- Id of the address from db
    [Address_Address1] nvarchar(max) NULL, -- First line of address
    [Address_Address2] nvarchar(max) NULL, -- Second line of address
    [Address_City] nvarchar(max) NULL, -- City name
    [Address_StateProvince] nvarchar(max) NULL, -- State Name
    [Address_PostalCode] nvarchar(max) NULL, -- Zip code
    [Address_CountryCode] nvarchar(max) NULL, -- Country Code
    [IsInLTC] bit NULL, -- Is member in LTC, Used by Claim Reversal
    [EthnicID] nvarchar(max) NULL
);
