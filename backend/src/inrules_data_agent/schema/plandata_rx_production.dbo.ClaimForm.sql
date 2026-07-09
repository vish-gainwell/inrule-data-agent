CREATE TABLE [plandata_rx_production].[dbo].[ClaimForm]
(
    [FormType] typecode DEFAULT (' ') NOT NULL,
    [FormTypeDesc] udtshortdesc DEFAULT (' ') NOT NULL,
    [ClaimType] typecode DEFAULT (' ') NOT NULL,
    [InactiveDate] udttermdate NULL,
    [DefaultForm] yesnotype DEFAULT ('N') NOT NULL,
    [DisplaySequence] zint DEFAULT ((0)) NOT NULL,
    [IsReferenceData] yesnotype DEFAULT ('Y') NOT NULL,
    [CreateId] udtuserid DEFAULT (suser_sname()) NOT NULL,
    [CreateDate] udtlongdate DEFAULT (getdate()) NOT NULL,
    [UpdateId] udtuserid DEFAULT (suser_sname()) NOT NULL,
    [LastUpdate] udtlongdate DEFAULT (getdate()) NOT NULL
);
