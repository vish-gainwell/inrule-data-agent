/* Live SQL Server schema from INFORMATION_SCHEMA and key metadata. */
CREATE TABLE [plandata_rx_production].[dbo].[planprovinfo]
(
    [provid] char(15) NOT NULL, -- Primary key of the provider table | PK marker: X | FK marker: X
    [programid] char(15) NOT NULL, -- Primary key of the program table | PK marker: X | FK marker: X
    [effdate] smalldatetime NOT NULL, -- Effective date of record | PK marker: X
    [carrierid] char(15) NOT NULL, -- Primary key of the carrier table | FK marker: X
    [termdate] smalldatetime NOT NULL, -- Termdate of record
    [planprovid] char(15) NOT NULL, -- Typically where we store Medicaid ID
    [pcp] int NOT NULL, -- Is provider a primary care physician for the plan
    [newassigns] int NOT NULL, -- Is provider taking new assignments
    [epsdt] int NOT NULL, -- Is the provider performing epsdt visits
    [maxmem] int NOT NULL, -- Maximum number of members in providers panel
    [agemin] int NOT NULL, -- Minimum age for entry in planprovinfo
    [agemax] int NOT NULL, -- Maximum age for entry in planprovinfo
    [provdirectory] int NOT NULL, -- Is the provider to be included in the plan's directory flag
    [obgyn] int NOT NULL, -- Is the provider an OB
    [lastupdate] datetime NOT NULL, -- Date this record was last updated
    [updateid] varchar(120) NOT NULL, -- Id of the user who last updated this record
    [createdate] datetime NOT NULL, -- Date this record was created
    [createid] varchar(120) NOT NULL, -- Id of the user who created this record
    [delegateprogramid] char(15) NOT NULL, -- UNDOCUMENTED
    [delegation] int NOT NULL, -- Is the provider delegated
    [sexr] char(1) NOT NULL, -- Sex restriction flag
    [provtier] int NOT NULL, -- Auto-Assign Provider Tier Level
    [feeid] char(15) NOT NULL, -- Provider fee id
    [planprovidlastupdate] smalldatetime NOT NULL, -- Date the planprovid column was changed
    [tradingpartnerid] char(15) NOT NULL, -- REFERENCES tradingpartner (tradingpartnerid) | FK marker: X
    [IsPaymentBundle] char(1) NULL, -- Value representing ispaymentbundle
    [IsICAPExcluded] char(1) NOT NULL, -- Value representing isicapexcluded
    [TeleHealth] char(1) NOT NULL,
    [ExternalPlanProvId] varchar(36) NOT NULL
);
