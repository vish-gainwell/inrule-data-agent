/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.eg_parameter_enrollstatus_hierarchy
Description: Stores prior authorization configuration, history, or workflow details.
*/

CREATE TABLE [HRX].[dbo].[eg_parameter_enrollstatus_hierarchy]
(
    [clientstate] char(2) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [planid] nchar(15) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [rateid] nchar(15) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [sequence] smallint NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [effdate] smalldatetime NULL, -- Date and time the record becomes effective
    [termdate] smalldatetime NULL, -- Date and time the record becomes inactive
    [recordid] int NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [status_group] nchar(15) NULL -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
);
