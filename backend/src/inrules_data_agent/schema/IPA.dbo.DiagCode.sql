/*
Authoritative schema with curated DED descriptions.
Description: Stores diagnosis-code reference data used for IPA processing, auditing, and healthcare claims evaluation.
*/

CREATE TABLE [IPA].[dbo].[DiagCode]
(
    [codegroup] char(30) NOT NULL, -- Grouping ICD classification associated with diagnosis code
    [codeid] char(8) NOT NULL, -- Diagnosis code identifier representing ICD value | PK marker: X
    [createdate] datetime NOT NULL, -- Date and time diagnosis code record was created
    [description] varchar(255) NOT NULL, -- Short description of diagnosis code
    [effdate] smalldatetime NOT NULL, -- Date and time diagnosis code becomes effective and available for use
    [grouper] char(30) NOT NULL, -- Grouping classification associated with diagnosis code
    [icd9type] char(15) NOT NULL, -- ICD 9 type classification
    [IcdVersion] char(1) NOT NULL, -- Version of ICD coding standard associated with diagnosis code | PK marker: X
    [createid] varchar(120) NOT NULL, -- Identifier of user who created the diagnosis code entry
    [updateid] varchar(120) NOT NULL, -- Identifier of user who last updated diagnosis code entry
    [requirepoa] char(1) NOT NULL, -- Indicator specifying whether a Present on Admission (POA) value is required for diagnosis code
    [lastupdate] datetime NOT NULL, -- Date and time diagnosis code record was last updated
    [longdescription] text NULL, -- Long description of diagnosis code
    [termdate] smalldatetime NOT NULL, -- Date and time diagnosis code expires and no longer valid for use
    [theyear] char(4) NOT NULL, -- Year associated with diagnosis code entry
    CONSTRAINT [PK_DiagCode] PRIMARY KEY ([codeid], [IcdVersion])
);
