CREATE TABLE [HRX].[dbo].[step_therapy_level]
(
    [stg_id] tinyint NOT NULL, -- Identifier for step therapy group
    [stl_id] tinyint NOT NULL, -- Identifier for step therapy level
    [min_step_days_cnt] smallint NOT NULL, -- Minimum number of days using prerequisite therapy to satisfy the step therapy level requirement
    [min_step_drug_cnt] tinyint NOT NULL, -- Minimum number of prequisite drugs tried and documented to satisfy the step therapy level requirement
    [max_gap_days_cnt] smallint NOT NULL, -- Maximum allowable gap, in days, between prequisite therapy claims when evaluating continuous therapy level requirement
    [change_user_name] varchar(32) NOT NULL, -- User who changed the record
    [change_date] datetime NOT NULL, -- Date and time the record was changed
    CONSTRAINT [PK_step_therapy_level] PRIMARY KEY ([stg_id], [stl_id])
);
