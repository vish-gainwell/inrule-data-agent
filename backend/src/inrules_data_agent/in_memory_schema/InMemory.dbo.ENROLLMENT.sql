/*
Logical Rules Engine in-memory dataset generated from EnrollmentDTO.

Runtime path: InRuleDTO.MemberDetails.Enrollments
Loader: hrxPOS_GetMemberEnrollment
Loader inputs: MemberID, DateOfService, NDC

This is not a physical SQL Server table and must not be executed through
/execute_query. String lengths are not specified by the DTO; the SQL-like
types below represent the C# property types only.
*/
CREATE TABLE [InMemory].[dbo].[ENROLLMENT]
(
    [MemberId] nvarchar(max) NOT NULL,
    [ProgramId] nvarchar(max) NULL,
    [EnrollId] nvarchar(max) NOT NULL,
    [CoverageCode] nvarchar(max) NULL,
    [BenefitPlanId] nvarchar(max) NOT NULL,
    [RateCode] nvarchar(max) NULL,
    [RateId] nvarchar(max) NULL,
    [SegType] nvarchar(max) NULL,
    [EffectiveDate] datetime2 NOT NULL,
    [TermDate] datetime2 NOT NULL,
    [CoverageEffectiveDate] datetime2 NOT NULL,
    [CoverageTermDate] datetime2 NOT NULL,
    [RestrictionId] nvarchar(max) NULL,
    [RestrictEffectiveDate] datetime2 NULL,
    [RestrictTermDate] datetime2 NULL,
    [Sequence] smallint NULL,
    [BenefitId] nvarchar(max) NULL,
    [CardholderId] nvarchar(max) NULL,
    [PersonCode] nvarchar(max) NULL
);
