CREATE TABLE [HRX].[dbo].[step_therapy_drug]
(
    [stg_id] tinyint NOT NULL, -- Identifier for step therapy group
    [stl_id] tinyint NOT NULL, -- Identifier for step therapy level
    [gcn_seqno] decimal(6,0) NOT NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [hicl_seqno] decimal(6,0) NOT NULL, -- Hierarchical Ingredient Code List
    [stl_eff_date] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [stl_end_date] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [change_user_name] varchar(32) NOT NULL, -- User who changed the record
    [change_date] datetime NOT NULL, -- Date and time the record was changed
    CONSTRAINT [PK_step_therapy_drug] PRIMARY KEY ([stg_id], [stl_id], [gcn_seqno])
);
