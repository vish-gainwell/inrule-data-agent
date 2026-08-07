/*
Authoritative schema with curated DED descriptions.
Description: Repository of Drug Efficacy Study Implementation (DESI) classifications and associated regulatory status indicators used to determine drug eligibility and reimbursement treatment.
*/
CREATE TABLE [HRX].[dbo].[NDC_DESI_Mstr]
(
    [NDCKey] char(11) NOT NULL, -- National Drug Code identifier for drug product
    [Source] char(1) NOT NULL, -- Identifier for source
    [DESI] char(1) NOT NULL, -- Drug Efficacy Study Implementation Indicator; specifies FDA evaluation status
    [DESIDate] datetime NULL, -- Effective Date for DESI classification or determination for drug
    [EffDate] datetime NOT NULL, -- Date and time the record becomes effective
    [EndDate] datetime NOT NULL, -- Date when the event or update occurred.
    [GCN_SeqNo] char(6) NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [HICL_SeqNo] char(6) NULL, -- Hierarchical Ingredient Code List
    [CreateDate] datetime NOT NULL, -- Date and time the record was created
    [CreatedBY] char(15) NOT NULL, -- Identifier of user who created the record
    [ChangedDate] datetime NOT NULL, -- Date and time the record was changed
    [ChangedBy] char(15) NOT NULL, -- Identifier of user who changed the record
    [Flag] char(1) NULL
);
