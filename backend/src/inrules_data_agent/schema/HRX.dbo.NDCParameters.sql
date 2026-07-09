/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.NDCParameters
Primary Key from metadata: PARAM_ID
Description: Stores prior authorization configuration, history, or workflow details.
*/

CREATE TABLE [HRX].[dbo].[NDCParameters]
(
    [PARAM_ID] numeric(16,0) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing | PK marker: X
    [PARAMETER_NAME] nvarchar(50) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PARAMETER_TITLE] nvarchar(100) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [PARAMETER_VALUE] nvarchar(100) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [DESCRIPTION] nvarchar(1000) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [EFFDATE] datetime NULL, -- Date and time the record becomes effective
    [ENDDATE] datetime NULL, -- Date and time the record becomes inactive
    [DEC_PARAM_VAL] decimal(18,5) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- Identifier of the user who changed the record
    CONSTRAINT [PK_NDCParameters] PRIMARY KEY ([PARAM_ID])
);
