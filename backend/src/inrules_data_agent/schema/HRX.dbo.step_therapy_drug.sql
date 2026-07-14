CREATE TABLE [HRX].[dbo].[step_therapy_drug]
(
    [stg_id] tinyint NOT NULL,
    [stl_id] tinyint NOT NULL,
    [gcn_seqno] decimal(6,0) NOT NULL,
    [hicl_seqno] decimal(6,0) NOT NULL,
    [stl_eff_date] smalldatetime NOT NULL,
    [stl_end_date] smalldatetime NOT NULL,
    [change_user_name] varchar(32) NOT NULL,
    [change_date] datetime NOT NULL,
    CONSTRAINT [PK_step_therapy_drug] PRIMARY KEY ([stg_id], [stl_id], [gcn_seqno])
);
