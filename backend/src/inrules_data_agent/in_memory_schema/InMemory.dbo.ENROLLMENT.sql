/*
Logical, non-executable Rules Engine in-memory dataset derived from EnrollmentDTO.

DTO path: InRuleDTO.MemberDetails.Enrollments
Mapping authority: IR_DTO_schema.xlsx, dto_tree.txt, and total_tree.txt.

This is not a physical SQL Server table and must not be executed through
/execute_query. String lengths are not specified by the DTO; the SQL-like
types below represent the C# property types only.
*/
/* Column description source: IR_DTO_schema.xlsx, DTO Schema tab. Only nonblank authoritative descriptions are included. */
CREATE TABLE [InMemory].[dbo].[ENROLLMENT]
(
    [MemberId] nvarchar(max) NOT NULL, -- Displays the unique ID of the enrollment record
    [ProgramId] nvarchar(max) NULL, -- Program ID associated with the enrollment record
    [EnrollId] nvarchar(max) NOT NULL, -- Enrollment ID associated with the enrollment record
    [CoverageCode] nvarchar(max) NULL, -- Coverage Code associated with the enrollment record
    [BenefitPlanId] nvarchar(max) NOT NULL, -- Displays the plan ID of the enrollment record
    [RateCode] nvarchar(max) NULL, -- Displays the rate code of the enrollment record
    [RateId] nvarchar(max) NULL, -- Rate Id
    [SegType] nvarchar(max) NULL, -- Segment Type
    [EffectiveDate] datetime2 NOT NULL, -- Displays the effective date of the member's enrollment segment
    [TermDate] datetime2 NOT NULL, -- Displays the termination date of the member's enrollment segment
    [CoverageEffectiveDate] datetime2 NOT NULL, -- Coverage effective date
    [CoverageTermDate] datetime2 NOT NULL, -- Coverage term date
    [RestrictionId] nvarchar(max) NULL, -- Restriction Id
    [RestrictEffectiveDate] datetime2 NULL, -- Restrict effective date
    [RestrictTermDate] datetime2 NULL, -- Restrict term date
    [Sequence] smallint NULL, -- Sequence number
    [BenefitId] nvarchar(max) NULL, -- Benefit Id
    [CardholderId] nvarchar(max) NULL, -- Cardholder Id
    [PersonCode] nvarchar(max) NULL -- Person Code
);
