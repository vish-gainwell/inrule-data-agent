/*
Logical Rules Engine in-memory dataset generated from MemberDTO.

Runtime path: InRuleDTO.MemberDetails
Loader: hrxPOS_GetMemberData

This is not a physical SQL Server table and must not be executed through
/execute_query. String lengths are not specified by the DTO; the SQL-like
types below represent the C# property types only.

Computed DTO properties:
  - AgeInMonths is calculated from BirthDate and the current application date.
  - AgeInYears is calculated from BirthDate and the current application date.

Nested DTO property:
  - Address contains an AddressDTO object. It is represented as logical JSON text
    until AddressDTO.cs is available for expansion.
*/
CREATE TABLE [InMemory].[dbo].[MEMBER]
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
    [AgeInYears] float(53) NOT NULL,
    [Address] nvarchar(max) NOT NULL,
    [IsInLTC] bit NULL,
    [EthnicID] nvarchar(max) NULL
);
