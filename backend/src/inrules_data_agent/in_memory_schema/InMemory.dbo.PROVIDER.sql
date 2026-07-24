/*
Logical, non-executable Rules Engine in-memory dataset derived from ProviderDTO.
DTO path: InRuleDTO.ClaimRequest.Provider
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.
This is not a physical SQL Server table. SQL types preserve workbook C#
types/nullability; unspecified string lengths use nvarchar(max).
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[PROVIDER]
(
    [ID] nvarchar(max) NOT NULL, -- The Unique Identifier for the Provider
    [NPI] nvarchar(max) NULL, -- National Provider Identifier
    [Name] nvarchar(max) NULL, -- Name of the Provider
    [ProviderType] nvarchar(max) NULL, -- Type of the Provider
    [ProviderTypeCode] nvarchar(max) NULL, -- Type of the Provider Code
    [Status] nvarchar(max) NULL, -- Status of the Provider, indicating if the Provider is Active, Inactive, or Incomplete
    [Phone] nvarchar(max) NULL, -- Phone Number of the Provider
    [Specialty] nvarchar(max) NULL, -- Description of the Provider's Specialty
    [CredentialStatus] nvarchar(max) NULL, -- Indicates if the Provider is Credentialed or not
    [Email] nvarchar(max) NULL, -- Email Address of the Provider
    [OIG] nvarchar(max) NULL, -- Inidicates the OIG based on the Provider's Prescriber Exclusions
    [PlanProviderId] nvarchar(max) NULL, -- Unique Identifier for the Plan Provider record
    [DEA] nvarchar(max) NULL, -- DEA Number
    [PhysicalAddress1] nvarchar(max) NULL, -- Physical Address Line 1
    [PhysicalAddress2] nvarchar(max) NULL, -- Physical Address Line 2
    [PhysicalCity] nvarchar(max) NULL, -- Physical Address City
    [PhysicalState] nvarchar(max) NULL, -- Physical Address State
    [PhysicalZip] nvarchar(max) NULL, -- Physical Address Zip
    [MailingAddress1] nvarchar(max) NULL, -- Mailing Address Line 1
    [MailingAddress2] nvarchar(max) NULL, -- Mailing Address Line 2
    [MailingCity] nvarchar(max) NULL, -- Mailing Address City
    [MailingState] nvarchar(max) NULL, -- Mailing Address State
    [MailingZip] nvarchar(max) NULL, -- Mailing Address Zip
    [ExternId] nvarchar(max) NULL, -- External Identifier for the Provider
    [GpciId] nvarchar(max) NULL, -- Geographic Practice Cost Index Identifier
    [OverrideRoleId] nvarchar(max) NULL, -- Override Role Identifier for the Provider
    [ExternalEditing] bit NOT NULL, -- Indicates if the Provider is enabled for external editing
    [MedicarePar] bit NOT NULL, -- Indicates if the Provider is a Medicare Participating Provider
    [PoaExempt] bit NOT NULL, -- Indicates if the Provider is POA (Present on Admission) Exempt
    [EntityId] nvarchar(max) NULL, -- Entity Identifier associated with the Provider
    [CoverageType] nvarchar(max) NULL, -- Coverage Type associated with the Provider
    [ClaimType] nvarchar(max) NULL, -- Claim Type associated with the Provider
    [ProviderClass] nvarchar(max) NULL -- Provider Class
);
