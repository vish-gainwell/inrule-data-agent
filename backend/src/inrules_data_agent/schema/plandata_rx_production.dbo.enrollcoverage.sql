/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: plandata_rx_production
Table: dbo.enrollcoverage
Primary Key from metadata: enrollcoverageid
Description: Coverage elections for enrolled members.
*/

CREATE TABLE [plandata_rx_production].[dbo].[enrollcoverage]
(
    [enrollcoverageid] ident DEFAULT (' ') NOT NULL, -- Primary key for the enrollcoverage table
    [enrollid] ident DEFAULT (' ') NOT NULL, -- Primary key from the enrollkeys table
    [ratecode] nametype DEFAULT (' ') NOT NULL, -- Ratecode (group num) assigned for the coverage
    [coveragecodeid] ident DEFAULT (' ') NOT NULL, -- Primary key from the coveragecode table
    [effdate] smalldatetime DEFAULT ('01/01/1980') NOT NULL, -- Effective date of the record
    [termdate] smalldatetime DEFAULT ('12/31/2078') NOT NULL, -- Termination date of the record
    [createid] udtuserid DEFAULT (suser_sname()) NOT NULL, -- Id of the user who created this record
    [createdate] createdatetype DEFAULT (getdate()) NOT NULL, -- Date this record was created
    [updateid] udtuserid DEFAULT (suser_sname()) NOT NULL, -- Id of the user who last updated this record
    [lastupdate] lastupdatetype DEFAULT (getdate()) NOT NULL, -- Date this record was last updated
    CONSTRAINT [PKenrollcoverage] PRIMARY KEY ([enrollcoverageid])
);
