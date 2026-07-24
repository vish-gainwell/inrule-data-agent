/*
Logical, non-executable Rules Engine in-memory dataset derived from MemberDetailsDTO
(MemberDTO base).

DTO path: InRuleDTO.MemberDetails
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.

This is not a physical SQL Server table and must not be executed through
/execute_query. String lengths are not specified by the DTO; the SQL-like
types below represent the C# property types only.

Computed DTO properties:
  - AgeInMonths is calculated from BirthDate and the current application date.
  - AgeInYears is calculated from BirthDate and the current application date.

AddressDTO properties are explicitly exposed by the references and are flattened
with an Address_ prefix.
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[MEMBER]
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
