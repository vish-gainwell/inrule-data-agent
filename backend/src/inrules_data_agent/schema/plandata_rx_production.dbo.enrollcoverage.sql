CREATE TABLE [plandata_rx_production].[dbo].[enrollcoverage]
(
    [enrollcoverageid] ident DEFAULT (' ') NOT NULL,
    [enrollid] ident DEFAULT (' ') NOT NULL,
    [ratecode] nametype DEFAULT (' ') NOT NULL,
    [coveragecodeid] ident DEFAULT (' ') NOT NULL,
    [effdate] smalldatetime DEFAULT ('01/01/1980') NOT NULL,
    [termdate] smalldatetime DEFAULT ('12/31/2078') NOT NULL,
    [createid] udtuserid DEFAULT (suser_sname()) NOT NULL,
    [createdate] createdatetype DEFAULT (getdate()) NOT NULL,
    [updateid] udtuserid DEFAULT (suser_sname()) NOT NULL,
    [lastupdate] lastupdatetype DEFAULT (getdate()) NOT NULL,
    CONSTRAINT [PKenrollcoverage] PRIMARY KEY ([enrollcoverageid])
);
