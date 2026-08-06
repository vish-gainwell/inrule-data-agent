/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS. */
CREATE TABLE [HRX].[dbo].[PA_master]
(
    [PK_INT] int NOT NULL,
    [planid] varchar(15) NOT NULL,
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [agemin] int NOT NULL,
    [agemax] int NOT NULL,
    [clinical] char(2) NOT NULL,
    [effdate] smalldatetime NOT NULL,
    [termdate] smalldatetime NOT NULL,
    [CreateDate] smalldatetime NOT NULL,
    [CreateBy] varchar(15) NULL,
    [ChangedDate] smalldatetime NOT NULL,
    [ChangedBy] varchar(15) NULL,
    [Defaction] char(1) NOT NULL,
    [auto_pa] char(1) NOT NULL
);
