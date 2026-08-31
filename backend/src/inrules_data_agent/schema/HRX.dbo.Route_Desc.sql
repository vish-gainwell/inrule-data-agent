/*
Authoritative live schema with curated DED descriptions.
Description: Lookup table providing standardized route-of-administration codes and descriptions (e.g., oral, injectable, topical, inhalation) used in drug classification and claims processing
*/
CREATE TABLE [HRX].[dbo].[Route_Desc]
(
    [GCRT] char(1) NOT NULL, -- GCN Route Code; route of administration (e.g., oral, injectable, topical, etc...) | PK marker: X
    [RT] varchar(10) NULL, -- Route Description
    [GCRT2] varchar(2) NULL, -- GCN Route Code (2-character)
    [GCRT_Desc] varchar(40) NULL, -- GCN Route Code description
    [SYSTEMIC] varchar(1) NULL, -- Systemic Route Indicator
    [SKEY_RT] varchar(2) NULL -- GCN Route Code (2-character)
);
