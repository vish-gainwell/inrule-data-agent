/* Live SQL Server schema from INFORMATION_SCHEMA and reviewed HRX metadata. */
CREATE TABLE [HRX].[dbo].[NCPDP_Reject_Codes]
(
    [PK_INT] int NOT NULL, -- Primary key for the NCPDP reject-code record
    [reject_code] varchar(3) NOT NULL, -- NCPDP reject error code
    [reject_desc] varchar(100) NOT NULL, -- Description of the reject code
    [effdate] smalldatetime NOT NULL, -- Effective date for the reject code
    [termdate] smalldatetime NOT NULL, -- Termination date for the reject code
    [CreateDate] smalldatetime NOT NULL,
    [CreateBy] varchar(15) NULL,
    [ChangedDate] smalldatetime NOT NULL,
    [ChangedBy] varchar(15) NULL,
    CONSTRAINT [PK_NCPDP_Reject_Codes] PRIMARY KEY ([PK_INT])
);
