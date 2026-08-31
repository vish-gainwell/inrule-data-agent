/*
Authoritative schema with curated DED descriptions.
Description: Central prior authorization repository containing authorization requests, member information, drug information, review status, approval periods, and clinical decision data used to manage the full PA lifecycle.
*/
CREATE TABLE [HRX].[dbo].[PA_master]
(
    [PK_INT] int NOT NULL, -- Unique identifier for prior authorization configuration record
    [planid] varchar(15) NOT NULL, -- Unique identifier for Plan
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [agemin] int NOT NULL, -- Minimum patient age allowed for dispensing or coverage
    [agemax] int NOT NULL, -- Maximum patient age allowed for dispensing or coverage
    [clinical] char(2) NOT NULL, -- Indicator specifying whether the prior authorization requires clincal review or clinical criteria evaluation
    [effdate] smalldatetime NOT NULL, -- Date and time the record becomes effective
    [termdate] smalldatetime NOT NULL, -- Date and time the record becomes inactive
    [CreateDate] smalldatetime NOT NULL, -- Date and time the record was created
    [CreateBy] varchar(15) NULL, -- User who created the record
    [ChangedDate] smalldatetime NOT NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- User who changed the record
    [Defaction] char(1) NOT NULL, -- Default action Indicator determining default processing outcome or workflow path
    [auto_pa] char(1) NOT NULL -- Indicator specifying whether eligible prior authorization requests can be automatically processed and adjudicated without manual intervention
);
