/*
Authoritative live schema with curated DED descriptions.
Description: Rule Engine grouping table used to organize related business rules into logical processing categories or evaluation sets
*/
CREATE TABLE [HRX].[dbo].[re_group]
(
    [RULE_PROCESSOR] varchar(50) NOT NULL, -- Name of rule engine, processor, or application component responsible for execution | PK marker: X
    [RULE_GROUP] varchar(50) NOT NULL, -- Categorical grouping of related business rules | PK marker: X
    [RULE_NAME] varchar(50) NOT NULL, -- Unique identifier of individual business rule (i.e., Edit ID) | PK marker: X
    [GROUP_ID] varchar(50) NOT NULL, -- Group identifier associating multiple rules within a processing group or evaluation set | PK marker: X
    [INSTANCE_ID] int NOT NULL -- Instance identifier for rule group instance to distinguish separate occurences or implementations
);
