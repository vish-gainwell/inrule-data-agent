/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS. */
CREATE TABLE [HRX].[dbo].[NDCMedicareCov]
(
    [MedicarePlan] varchar(5) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [GCN_SeqNo] varchar(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [HIC3] varchar(6) NULL, -- Hierarchical Specific Therapeutic Class code
    [Program_Ind] char(1) NOT NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [EffDate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [TermDate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [NH_Ind] char(1) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ChangedDate] smalldatetime NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- Identifier of the user who changed the record
    [ndckey] char(11) NULL -- National Drug Code identifier for drug product
);
