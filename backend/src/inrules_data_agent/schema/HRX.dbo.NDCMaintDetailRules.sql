/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.NDCMaintDetailRules
Primary Key from metadata: Action_Code
Description: Stores National Drug Code reference, pricing, limits, or classification data.
*/

CREATE TABLE [HRX].[dbo].[NDCMaintDetailRules]
(
    [Action_Code] varchar(10) NOT NULL, -- Short description of action category | PK marker: X
    [ActionRule] varchar(200) NULL, -- Long description of action code definition, describing conditional rule(s) for action category
    CONSTRAINT [PK_NDCMaintDetailRules] PRIMARY KEY ([Action_Code])
);
