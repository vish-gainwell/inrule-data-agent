/*
Logical, non-executable Rules Engine in-memory dataset derived from ProviderDTO.
DTO path: InRuleDTO.ClaimRequest.Provider
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[PROVIDER]
(
    [ID] nvarchar(max) NOT NULL,
    [NPI] nvarchar(max) NULL,
    [Name] nvarchar(max) NULL,
    [ProviderType] nvarchar(max) NULL,
    [ProviderTypeCode] nvarchar(max) NULL,
    [Status] nvarchar(max) NULL,
    [Phone] nvarchar(max) NULL,
    [Specialty] nvarchar(max) NULL,
    [CredentialStatus] nvarchar(max) NULL,
    [Email] nvarchar(max) NULL,
    [OIG] nvarchar(max) NULL,
    [PlanProviderId] nvarchar(max) NULL,
    [DEA] nvarchar(max) NULL,
    [PhysicalAddress1] nvarchar(max) NULL,
    [PhysicalAddress2] nvarchar(max) NULL,
    [PhysicalCity] nvarchar(max) NULL,
    [PhysicalState] nvarchar(max) NULL,
    [PhysicalZip] nvarchar(max) NULL,
    [MailingAddress1] nvarchar(max) NULL,
    [MailingAddress2] nvarchar(max) NULL,
    [MailingCity] nvarchar(max) NULL,
    [MailingState] nvarchar(max) NULL,
    [MailingZip] nvarchar(max) NULL,
    [ExternId] nvarchar(max) NULL,
    [GpciId] nvarchar(max) NULL,
    [OverrideRoleId] nvarchar(max) NULL,
    [ExternalEditing] bit NOT NULL,
    [MedicarePar] bit NOT NULL,
    [PoaExempt] bit NOT NULL,
    [EntityId] nvarchar(max) NULL,
    [CoverageType] nvarchar(max) NULL,
    [ClaimType] nvarchar(max) NULL,
    [ProviderClass] nvarchar(max) NULL
);
