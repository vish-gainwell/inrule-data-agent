/*
Logical, non-executable Rules Engine in-memory dataset backed by a DataTable.

Runtime path: Driver.Claim.Tables[HrxClaim.DurEventTableName]
Mapping authority: the authoritative HRX dbo.EVENT DDL and the RxPOS DUR code
that clones the event result schema into the DataTable and accesses these exact
physical column names directly.

Unlike the other InMemory catalog entries, EVENT has no DTO mapping layer in
the verified RxPOS path. This table must not be executed through /execute_query.
*/
CREATE TABLE [InMemory].[dbo].[EVENT]
(
    [ICN] varchar(50) NULL,
    [Data_Base_Ind] varchar(50) NULL,
    [Dur_Conflict_Code] varchar(50) NULL,
    [Dur_Msg] varchar(128) NULL,
    [Other_Pharmacy_Ind] varchar(50) NULL,
    [Other_Prescriber_Ind] varchar(50) NULL,
    [Overlap_Days] varchar(50) NULL,
    [Physician_Prescriber] varchar(50) NULL,
    [Prev_Fill_Date] varchar(50) NULL,
    [Prev_Fill_Qty] varchar(50) NULL,
    [Prev_Icn] varchar(50) NULL,
    [Prev_Ndc] varchar(50) NULL,
    [Prev_Prov_Id] varchar(50) NULL,
    [Recip_Id_Orig] varchar(50) NULL,
    [Prev_Rx_Nbr] varchar(50) NULL,
    [Severity_Level] varchar(50) NULL,
    [Severity_Ranking_Code] varchar(50) NULL,
    [Dur_Overflow_Flag] varchar(50) NULL,
    [Curr_Ndc] varchar(50) NULL,
    [Curr_Gcn] varchar(50) NULL,
    [Curr_Gcnseqno] varchar(50) NULL,
    [Curr_Metric_Qty] varchar(50) NULL,
    [Curr_Metric_Dqty] varchar(50) NULL,
    [Curr_Skey] varchar(50) NULL,
    [Event_Inhibit] varchar(50) NULL,
    [Hic_Current] varchar(50) NULL,
    [Hic_History] varchar(50) NULL,
    [Extra_Dur_Info] varchar(128) NULL,
    [Ndc_Index] int NOT NULL
);
