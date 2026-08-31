/*
Authoritative live schema with curated DED descriptions.
Description: Configuration table supporting COVID-related drug, vaccine, and treatment processing rules, including dosage limits, switching windows, therapeutic classifications, and NDC associations
*/
CREATE TABLE [HRX].[dbo].[Covid_Config]
(
    [COVIDID] int NOT NULL, -- Unique identifier for COVID Configuration line
    [Manufacturer] varchar(100) NOT NULL, -- Manufacturer Name
    [NDCKey] char(11) NOT NULL, -- National Drug Code identifier for drug product | PK marker: X
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [HIC3] char(3) NULL, -- Hierarchical Specific Therapeutic Class code
    [CPT] varchar(10) NULL, -- Current Procedural Terminology identifier code
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [DoseCount] char(1) NOT NULL, -- Number of doses required or allowed under drug regimen
    [DoseDays_2] char(3) NULL, -- Minimum number of days elapsed after first dose before second dose is eligible
    [MaxDoseDays_2] char(3) NULL, -- Maximum number of days elapsed after first dose before second dose is eligible
    [DoseDays_3] char(3) NULL, -- Minimum number of days elapsed after second dose before third dose is eligible
    [MaxDoseDays_3] char(3) NULL, -- Maximum number of days elapsed after second dose before third dose is eligible
    [SwitchDays] char(3) NULL, -- Number of days within which member may switch between eligible COVID products as part of same treatment series
    [DifferentNDC] char(1) NULL, -- Indicator specifying whether a different NDC is used
    [ChangedBy] char(15) NOT NULL, -- User who changed the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [Notes] varchar(512) NULL -- Long description comment
);
