/*
Authoritative schema with curated DED descriptions.
Description: Exception-monitoring table used to identify gaps, inconsistencies, or missing configurations within prior authorization programs that may require administrative intervention or rule maintenance.
Reviewed relationship: PA_Gap.referralid = plandata_rx_production.dbo.referral.referralid.
*/
CREATE TABLE [HRX].[dbo].[PA_Gap]
(
    [referralid] varchar(30) NOT NULL, -- Unique identifier for prior authorization referral case | PK marker: X
    [totalunits] decimal(18,3) NULL, -- Total unit quantity required or associated with prior authorization case
    [type] varchar(15) NULL, -- Specifies classification of prior authorization request or referral type (e.g., Regular)
    [prescriberID] varchar(15) NULL, -- Prescriber identifier, typically a pharmacy NPI
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [origin_src] varchar(20) NULL, -- Source system or application from which prior authorization request originated
    [origin_method] varchar(20) NULL, -- Method used to initiate or submit prior authorization request (e.g., Call, Portal, FAX, Mail)
    [ProviderID] varchar(15) NULL, -- Pharmacy NPI (National Provider Identifier)
    [ReceivedDateTime] datetime NULL, -- Date and time the prior authorization request was received by system
    [PA_Lock_Ind] varchar(1) NULL, -- Indicates whether the prior authorization record is locked against updates during processing
    [AssignedUser] varchar(15) NULL, -- User responsible for creation or update
    [DueDate] datetime NULL, -- Date when the event or update occurred
    [AddlRecDateTime] datetime NULL, -- Date and time additional information, documentation, or records were reviewed by system
    [Service_Desc] varchar(60) NULL, -- Description of healthcare service, therapy, treatment, or drug associated with prior authorization request
    [ReasonTypeId] int NULL, -- Identifier representing reason category, exception type, or gap condition of the record
    [StatusDisplay] varchar(15) NULL, -- Current displayed status of prior authorization request or exception record (e.g., Pending, Approved, Denied)
    [MedicaidID] varchar(15) NULL, -- Medicaid member identifier
    [PharmacyMedicaidID] varchar(15) NULL, -- Pharmacy Medicaid member identifier
    [TATStartTime] datetime NULL, -- Date and time turnaround time (TAT) measurement began for prior authorization request
    [NMIStartTime] datetime NULL, -- Date and time No More Information (NMI) review period was initiated for prior authorization request
    [NMIRemovalTime] datetime NULL, -- Date and time No More Information (NMI) status was removed from prior authorization request
    [InitialEndDate] datetime NULL, -- Expected completion date for prior authorization review process
    [TATDuration] int NULL, -- Total elapsed turnaround time (TAT) for processing prior authorization request
    [Reason] varchar(500) NULL -- Short description of identified gap associated with prior authorization request
);
