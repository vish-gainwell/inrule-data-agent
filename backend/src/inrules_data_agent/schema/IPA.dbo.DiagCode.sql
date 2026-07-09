/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: IPA
Table: dbo.DiagCode
Primary Key from metadata: codeid, IcdVersion
Description: Stores detailed records and attributes related to the Diagnosis Code, used for IPA processing, auditing, or healthcare claims evaluation.
*/

CREATE TABLE [IPA].[dbo].[DiagCode]
(
    [codegroup] char(30) NOT NULL, -- Code group associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [codeid] char(8) NOT NULL, -- Code identifier associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking | PK marker: X
    [createdate] datetime NOT NULL, -- Creation date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [description] varchar(255) NOT NULL, -- Description associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [effdate] smalldatetime NOT NULL, -- Effective date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [grouper] char(30) NOT NULL, -- Grouper associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [icd9type] char(15) NOT NULL, -- ICD 9 type associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [IcdVersion] char(1) NOT NULL, -- ICD version associated with the Diagnosis Code entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking | PK marker: X
    [createid] varchar(120) NOT NULL, -- Identifier of the user who created the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [updateid] varchar(120) NOT NULL, -- Identifier of the user who last updated the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [requirepoa] char(1) NOT NULL, -- Indicates if POA is required for the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [lastupdate] datetime NOT NULL, -- Last updated date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [longdescription] text NULL, -- Long description associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [termdate] smalldatetime NOT NULL, -- Termination date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    [theyear] char(4) NOT NULL, -- Year associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking
    CONSTRAINT [PK_DiagCode] PRIMARY KEY ([codeid], [IcdVersion])
);
