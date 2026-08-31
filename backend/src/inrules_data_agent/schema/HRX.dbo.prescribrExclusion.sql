/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.prescribrExclusion
Primary Key from metadata: NPI, EffDate
Description: Stores domain-specific configuration, reference, or transaction data.
*/

CREATE TABLE [HRX].[dbo].[prescribrExclusion]
(
    [NPI] char(10) NOT NULL, -- National Provider ID | PK marker: X
    [DEA] char(9) NULL, -- DEA Registration Number
    [LastName] varchar(60) NULL, -- Last Name of Provider or Facility Name
    [FirstName] varchar(35) NULL, -- First Name of Provider
    [BusinessName] varchar(95) NULL, -- Name of Business associated with provider
    [EffDate] datetime NOT NULL, -- Date and time the record becomes effective | PK marker: X
    [EndDate] datetime NOT NULL, -- Date and time the record becomes inactive
    [ChangedBy] char(15) NOT NULL, -- User who changed the record
    [CreateDate] datetime NOT NULL, -- Date and time the record was created
    [UpdateDate] datetime NOT NULL, -- Date and time the record was updated
    [Notes] varchar(2000) NULL, -- Long description comment, including date timestamp and user notations
    CONSTRAINT [PK_prescribrExclusion] PRIMARY KEY ([NPI], [EffDate])
);
