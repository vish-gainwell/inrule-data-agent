/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS. */
CREATE TABLE [HRX].[dbo].[DrugCoverage]
(
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product
    [Planid] char(15) NOT NULL,
    [EffDate] smalldatetime NOT NULL,
    [TermDate] smalldatetime NOT NULL,
    [CreatedBy] varchar(120) NOT NULL,
    [CreateDate] datetime NOT NULL,
    [ChangedBy] varchar(120) NOT NULL,
    [ChangedDate] datetime NOT NULL
);
