/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS and key metadata. */
CREATE TABLE [plandata_rx_production].[dbo].[MemberLockIn]
(
    [MemId] char(15) NOT NULL, -- Identifier for mem | PK marker: X | FK marker: X
    [LockInTypeId] char(5) NOT NULL, -- Identifier for lockintype | PK marker: X | FK marker: X
    [LockInSubTypeId] char(5) NOT NULL, -- Identifier for lockinsubtype | PK marker: X | FK marker: X
    [ProvId] char(15) NOT NULL, -- Identifier for prov | PK marker: X | FK marker: X
    [ServiceLocation] char(15) NOT NULL, -- Value representing servicelocation | PK marker: X | FK marker: X
    [SpecialtyCode] char(15) NOT NULL, -- Value representing specialtycode | PK marker: X | FK marker: X
    [EffDate] smalldatetime NOT NULL, -- Effective date of record | PK marker: X
    [TermDate] smalldatetime NOT NULL, -- Term date of this record
    [CreateId] varchar(120) NOT NULL, -- Id of the user who created this record
    [CreateDate] datetime NOT NULL, -- Date this record was created
    [UpdateId] varchar(120) NOT NULL, -- Id of the user who last updated this record
    [LastUpdate] datetime NOT NULL, -- Date this record was last updated
    CONSTRAINT [PKMemberLockIn] PRIMARY KEY
        ([MemId], [LockInTypeId], [LockInSubTypeId], [ProvId], [ServiceLocation], [SpecialtyCode], [EffDate])
);
