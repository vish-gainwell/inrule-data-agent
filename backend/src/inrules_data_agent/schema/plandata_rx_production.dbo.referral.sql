/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: plandata_rx_production
Table: dbo.referral
Primary Key from metadata: referralid
Description: Provider referral records.
*/

CREATE TABLE [plandata_rx_production].[dbo].[referral]
(
    [referralid] ident DEFAULT (' ') NOT NULL, -- Primary key of the referral table
    [enrollid] ident DEFAULT (' ') NOT NULL, -- Primary key of the enrollment table
    [memid] ident DEFAULT (' ') NOT NULL, -- Primary key of the member table
    [servicecode] ident DEFAULT (' ') NOT NULL, -- The services that can be performed. Ties to the authcode table to identify the template.
    [COB] zint DEFAULT (0) NOT NULL, -- Not Used
    [referto] ident DEFAULT (' ') NOT NULL, -- The provider that is being referred to
    [effdate] smalldatetime DEFAULT ('01/01/1980') NOT NULL, -- Effective date of record
    [referfrom] ident DEFAULT (' ') NOT NULL, -- The provider that request the referral. Typically the primary care provider
    [emergency] zint DEFAULT (0) NOT NULL, -- Emergency Authorization flag
    [authorizationid] char(30) DEFAULT (' ') NOT NULL, -- Authorization identifier for the referral. Typically number given to provider to reference the referral 2.6 (005): Expand to char(30)
    [lastupdate] lastupdatetype DEFAULT (getdate()) NOT NULL, -- Date this record was last updated
    [referraldate] smalldatetime NULL, -- Date of referral issue
    [transferinout] zint DEFAULT (0) NOT NULL, -- 1 - Transfer In , 2 - Transfer Out
    [admitphys] longname DEFAULT (' ') NOT NULL, -- Admitting physician
    [disdiagnosis] udtdiagcode DEFAULT (' ') NOT NULL, -- ICD9 diagnosis at the time of discharge
    [admitdate] smalldatetime NULL, -- Admission date for entry in referral
    [numappt] zint DEFAULT (0) NOT NULL, -- Not Used
    [dischargedate] smalldatetime NULL, -- Date of discharge
    [tier1] zint DEFAULT (0) NOT NULL, -- Not Used
    [tier2] zint DEFAULT (0) NOT NULL, -- Not Used
    [staytype1] zint DEFAULT (0) NOT NULL, -- Not Used
    [termdate] smalldatetime DEFAULT ('12/31/2078') NOT NULL, -- Termdate of this record
    [staytype2] zint DEFAULT (0) NOT NULL, -- Not Used
    [issueinitials] ident DEFAULT (' ') NOT NULL, -- Auth Issuing - User Initials
    [actual1] zint DEFAULT (0) NOT NULL, -- Not Used
    [actual2] zint DEFAULT (0) NOT NULL, -- Not Used
    [actualstay1] zint DEFAULT (0) NOT NULL, -- Not Used
    [actualstay2] zint DEFAULT (0) NOT NULL, -- Not Used
    [daysdenied] zint DEFAULT (0) NOT NULL, -- Not Used
    [deferreddliab] zint DEFAULT (0) NOT NULL, -- Not Used
    [reinsurance] zint DEFAULT (0) NOT NULL, -- Third Party Liability
    [costest] zmoney DEFAULT (0) NOT NULL, -- Not Used
    [perdiemest] zmoney DEFAULT (0) NOT NULL, -- Per diem estimate on the referral
    [accchg] zmoney DEFAULT (0) NOT NULL, -- Not Used
    [createdate] createdatetype DEFAULT (getdate()) NOT NULL, -- Date this record was created
    [createid] udtuserid DEFAULT (suser_sname()) NOT NULL, -- Id of the user who created this record
    [updateid] udtuserid DEFAULT (suser_sname()) NOT NULL, -- Id of the user who last updated this record
    [diagnosis] udtdiagcode DEFAULT (' ') NOT NULL, -- Not Used
    [admit] zint DEFAULT (0) NOT NULL, -- Admit flag
    [status] umstatustype DEFAULT (' ') NOT NULL, -- Status of the entry in referral
    [numremappt] zint DEFAULT (0) NOT NULL, -- Not Used
    [acuity] typecode DEFAULT (' ') NOT NULL, -- Urgent, Emergency, and Elective acuity type
    [attprovid] ident DEFAULT (' ') NOT NULL, -- Attending provider identifier. Foreign key to provider
    [admtprovid] ident DEFAULT (' ') NOT NULL, -- Admitting provider id
    [self] yesnotype DEFAULT ('N') NOT NULL, -- Is the referral a self referral flag
    [asstsurgeon] ident DEFAULT (' ') NOT NULL, -- Provider ID of Assistant Surgeon
    [authstatus] umstatustype DEFAULT (' ') NOT NULL, -- Status of the authorization
    [hasassist] yesnotype DEFAULT ('N') NOT NULL, -- has Assistant Surgeon
    [receiptdate] smalldatetime NULL, -- Not Yet Used - Authorization Receipt Date
    [seendate] smalldatetime NULL, -- Not Yet Used - Date Member was in PCP office
    [userid] zint DEFAULT (0) NOT NULL, -- Id of user that entered referral
    [outofarea] yesnotype DEFAULT ('N') NOT NULL, -- Flag to indicate if it is an out of area referral
    [ispredetermination] yesnotype DEFAULT ('N') NOT NULL, -- Flag to indicate auth was created in predetermination.
    [paytoaffiliationid] ident DEFAULT (' ') NOT NULL, -- Providers pay to affiliation id
    [hasdocuments] yesnotype DEFAULT ('N') NOT NULL, -- Flag for auth has documents attached
    [isautodischargedate] yesnotype DEFAULT ('Y') NOT NULL, -- Indicates if the dischargedate field is the result of automatic calculation or was it overriden by a manual entry
    [referfromnetwork] ident DEFAULT (' ') NOT NULL, -- Network (provid) being referred from
    [pendclaims] yesnotype DEFAULT ('N') NOT NULL, -- Indicates whether the claim(s) will pend when this authorization is used
    [refertoprovtype] ident DEFAULT (' ') NOT NULL, -- Primary key from the providertype table
    [refertopar] yesnotype DEFAULT ('Y') NOT NULL, -- Specifies the par status of the actual referred provider
    [refertolocation] char(2) DEFAULT (' ') NOT NULL, -- Specifies the actual HCFA location for the professional services
    [isglobal] yesnotype DEFAULT ('N') NOT NULL, -- Determines if the authorization is a global authorization.
    [accidentcause] char(1) DEFAULT (' ') NOT NULL, -- Cause of accident: (A)uto, (E)mployment, (O)ther, ' '
    [accidentdate] datetime NULL, -- Date accident occurred
    [investigation] yesnotype DEFAULT ('N') NOT NULL, -- Is an investigation required
    [lmpdate] datetime NULL, -- last menstrual period date
    [estdeldate] datetime NULL, -- Estimated date of delivery
    [surgerydatetime] datetime NULL, -- Surgery date
    [decrementtype] char(3) DEFAULT ('SVC') NOT NULL, -- Used by adjudication to determin how the units will be decremented from the claim SVC - Servide DOS - Date of Service PRV - Date of Service by Provider
    [surgerysuggested] yesnotype DEFAULT ('N') NOT NULL, -- Indicates if surgery was suggested for this referral
    [appeal] char(1) DEFAULT ('N') NOT NULL, -- Indicates if this referral is an appeal
    [appealdate] smalldatetime DEFAULT ('12/31/2078') NOT NULL, -- Date of the appeal
    [reviewtype] char(1) DEFAULT ('A') NOT NULL, -- Determines type of review document: A-Authorization, C-Certification or R-Referral
    [beneprefid] ident DEFAULT (' ') NOT NULL, -- Primary key of the benepreference table
    [appealoutcome] shortdesctype DEFAULT (' ') NOT NULL, -- Outcome of the appeal
    [penaltyapplies] yesnotype DEFAULT ('N') NOT NULL, -- Determines if non-compliance penalties apply to claims that use this authorization
    [retroreview] yesnotype DEFAULT ('N') NOT NULL, -- Determines if authorization is retrospective
    [reqlos] zint DEFAULT (0) NOT NULL, -- Requested length of stay
    [actuallos] zint DEFAULT (0) NOT NULL, -- Actual length of stay
    [processlogid] ident DEFAULT (' ') NOT NULL, -- Stores the processlogid of the record in the ProcessLogHeader table in the planintegration database that is generated when the 278 transaction is processed by BizTalk
    [source] char(1) DEFAULT ('U') NOT NULL, -- Identifies the source the authorization was generated from Q = QNXT/QMACS, H = HIPAA2.4 (129)C = Case Manager Module 3.4 SP05 (TZIX PDR 02.B) W = HealthWeb
    [h278responseneeded] char(1) DEFAULT ('N') NOT NULL, -- Determines whether a 278 response is needed for an authorization received via HIPAA (Y/N)
    [h278responsesent] datetime DEFAULT ('1/1/1900') NOT NULL, -- Indicates the date/time a response was sent for an authorization received via HIPAA
    [h278processlogdetailid] ident DEFAULT (' ') NOT NULL, -- Identifier from the processlogdetail table that this record is tied to
    [h278responsestatus] char(1) DEFAULT ('N') NOT NULL, -- The current status of the 278 response: (F)inal, (I)ntermediate, (N)one
    [reqpatinfo] yesnotype DEFAULT ('N') NOT NULL, -- Indicates if additional information has been requested
    [h278haschanges] yesnotype DEFAULT ('N') NOT NULL, -- Indicates whether the requested data (from 278 transaction) and the current data differs (Y/N)
    [dispositionid] ident NULL, -- Foreign key to umdisposition. The disposition of the utilization management document.
    [priority] char(1) NULL, -- Identifies UM documents that are flagged as High Priority by the user. Manually maintained by the user. Values allowed are H = High or NULL (NOTE: NULL is treated as BLANK)
    [highlight] char(1) NULL, -- highlight
    [nextreviewdate] smalldatetime NULL, -- Date UM Document needs to be reviewed.
    [DiagnosisIcdVersion] char(1) NULL, -- Value representing diagnosisicdversion
    [DisDiagnosisIcdVersion] char(1) NULL, -- Value representing disdiagnosisicdversion
    [MergeFromReferralId] ident NULL, -- Identifier for mergefromreferral
    [IsConsolidated] yesnotype NULL, -- Date related to isconsolidated
    [ServiceAffilId] ident NULL, -- Identifier for serviceaffil
    [DefaultContractId] ident NULL, -- Identifier for defaultcontract
    [TOTALBUDGET] zmoney DEFAULT ((0.00)) NOT NULL, -- Value representing totalbudget
    [USEDBUDGET] zmoney DEFAULT ((0.00)) NOT NULL, -- Value representing usedbudget
    [IsBundled] yesnotype DEFAULT ('N') NULL, -- Value representing isbundled
    [trackingnumber] varchar(50) NULL,
    [ReqTotalBudget] zmoney DEFAULT ((0)) NOT NULL,
    [ApplyDecrement] char(1) DEFAULT ('H') NOT NULL,
    CONSTRAINT [PKreferral] PRIMARY KEY ([referralid])
);
