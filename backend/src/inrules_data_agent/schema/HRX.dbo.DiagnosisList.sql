/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.DiagnosisList
Primary Key from metadata: diagnosis_ID
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[DiagnosisList]
(
    [diagnosis_ID] int NOT NULL, -- Unique identifier for diagnosis line | PK marker: X
    [diagnosis_type] char(25) NOT NULL, -- Short description of diagnosis type category
    [diagnosis_code] char(8) NOT NULL, -- ICD Diagnosis Code; identifies patient conditions relevant for claims adjudication, coverage validation, or regulatory requirements
    [EffDate] datetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [TermDate] datetime NOT NULL, -- Date and time the record becomes inactive
    [description] varchar(255) NOT NULL, -- Long description of diagnosis type category
    [IcdVersion] char(1) NOT NULL, -- Indicator specifying version of ICD coding system
    [createid] varchar(120) NOT NULL, -- User who created the record
    [createdate] datetime NOT NULL, -- Date and time the record was created
    [updateid] varchar(120) NOT NULL, -- User who changed the record
    [lastupdate] datetime NOT NULL, -- Date and time an event or change occurred
    CONSTRAINT [PK_DiagnosisList] PRIMARY KEY ([diagnosis_ID], [EffDate])
);
