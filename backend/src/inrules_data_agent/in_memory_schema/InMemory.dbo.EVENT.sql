/*
Logical, non-executable Rules Engine in-memory dataset derived from DUREventDTO.

DTO source: pharm-pbm-rxpos/components/schemas/RxPOS.Schemas/Shared/
RequestModels/DUREventDTO.cs

This logical schema represents the properties exposed by DUREventDTO, not the
broader physical HRX dbo.EVENT/DataTable schema. It must not be executed through
/execute_query. String lengths are not specified by the DTO and therefore use
nvarchar(max).
*/
CREATE TABLE [InMemory].[dbo].[EVENT]
(
    [SeverityRankingCode] int NOT NULL,
    [SeverityLevel] nvarchar(max) NULL,
    [ConflictCode] nvarchar(max) NULL,
    [ICN] nvarchar(max) NULL,
    [PrevICN] nvarchar(max) NULL,
    [NdcIndex] int NOT NULL
);
