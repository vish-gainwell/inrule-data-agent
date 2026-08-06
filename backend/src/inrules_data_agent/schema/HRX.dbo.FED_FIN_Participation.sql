/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS. */
CREATE TABLE [HRX].[dbo].[FED_FIN_Participation]
(
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product
    [FFP_Typ] varchar(2) NOT NULL,
    [FFP_DateC] smalldatetime NOT NULL,
    [FFP_IND] varchar(1) NULL
);
