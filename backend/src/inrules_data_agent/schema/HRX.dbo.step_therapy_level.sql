CREATE TABLE [HRX].[dbo].[step_therapy_level]
(
    [stg_id] tinyint NOT NULL,
    [stl_id] tinyint NOT NULL,
    [min_step_days_cnt] smallint NOT NULL,
    [min_step_drug_cnt] tinyint NOT NULL,
    [max_gap_days_cnt] smallint NOT NULL,
    [change_user_name] varchar(32) NOT NULL,
    [change_date] datetime NOT NULL,
    CONSTRAINT [PK_step_therapy_level] PRIMARY KEY ([stg_id], [stl_id])
);
