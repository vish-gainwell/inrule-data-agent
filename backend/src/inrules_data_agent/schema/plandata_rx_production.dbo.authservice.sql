/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: plandata_rx_production
Table: dbo.authservice
Primary Key from metadata: referralid, sequence, globaltemplate
Description: Services approved, denied, or pending under authorization.
*/

CREATE TABLE [plandata_rx_production].[dbo].[authservice]
(
    [referralid] ident DEFAULT (' ') NOT NULL, -- Primary key of the referral table
    [sequence] zint DEFAULT (0) NOT NULL, -- unique sequence number to identify services for authorization
    [codeid] char(11) DEFAULT (' ') NOT NULL, -- Approved service code either CPT or Revenue code
    [medcoverage] char(1) DEFAULT (' ') NOT NULL, -- Flag determining if this service gives medical coverage
    [carelevel] char(1) DEFAULT (' ') NOT NULL, -- Indicates carelevel of this service
    [servcategory] cattype DEFAULT ('CPT') NOT NULL, -- Service Category for the authservice line
    [status] statustype DEFAULT ('OPEN') NOT NULL, -- Status of the entry in authservice
    [xreasoncode] typecode DEFAULT (' ') NOT NULL, -- NO LONGER USED - old reasoncode
    [overridecontract] yesnotype DEFAULT ('N') NOT NULL, -- Indicates that a contract for cares services is in place that overrides the current contract
    [totalunits] zmoney DEFAULT ((0)) NOT NULL, -- Total units for the authservice entry
    [usedunits] zmoney DEFAULT ((0)) NOT NULL, -- Number of units used
    [actualunits] zmoney DEFAULT ((0)) NOT NULL, -- No of units used - overrides totalunits if loaded
    [tier] ident DEFAULT (' ') NOT NULL, -- tier level for approved service.
    [dosdate] smalldatetime NOT NULL, -- Date of Service
    [globalday] zint DEFAULT (0) NOT NULL, -- Number of days a member can come back for a service related to this service and still count against initial visit
    [reqcodeid] char(11) DEFAULT (' ') NOT NULL, -- Indicates if the authservice code is required for the authservice line
    [catid] ident DEFAULT (' ') NOT NULL, -- Category ID. Primary key of the svccategory table.
    [subcatid] ident DEFAULT (' ') NOT NULL, -- Service sub category ID. Along with catid make up the primary key of the svcsubcategory table.
    [svcgroupid] ident DEFAULT (' ') NOT NULL, -- Service Group ID. Along with catid and subcatid make up the primary key of the svccatgroup table.
    [reqcatid] ident DEFAULT (' ') NOT NULL, -- Requested category ID - approving service group on authorization.
    [reqsubcatid] ident DEFAULT (' ') NOT NULL, -- Requested sub category ID - approving service group on authorization
    [reqsvcgrpid] ident DEFAULT (' ') NOT NULL, -- Requested service group ID - approving service group on authorization.
    [createid] udtuserid DEFAULT (suser_sname()) NOT NULL, -- Id of the user who created this record
    [createdate] createdatetype DEFAULT (getdate()) NOT NULL, -- Date this record was created
    [updateid] udtuserid DEFAULT (suser_sname()) NOT NULL, -- Id of the user who last updated this record
    [lastupdate] lastupdatetype DEFAULT (getdate()) NOT NULL, -- Date this record was last updated
    [modcode] modifiertype DEFAULT (' ') NOT NULL, -- Modifier code
    [modcode2] modifiertype DEFAULT (' ') NOT NULL, -- 2nd Modifier code
    [toothnumber] toothtype DEFAULT (' ') NOT NULL, -- Dental - tooth number for service selected.
    [toothsurface] char(5) DEFAULT (' ') NOT NULL, -- Tooth surface description that is covered under this service
    [approvedcodeid] servicecode DEFAULT (' ') NOT NULL, -- Approved code for service line.
    [modcode3] modifiertype DEFAULT (' ') NOT NULL, -- 3rd Modifier code
    [modcode4] modifiertype DEFAULT (' ') NOT NULL, -- 4th Modifier code
    [modcode5] modifiertype DEFAULT (' ') NOT NULL, -- 5th Modifier code
    [globaltemplate] yesnotype DEFAULT ('N') NOT NULL, -- Determines if the service comes from an authorization template or referral.
    [negotiatedcontract] ident DEFAULT (' ') NOT NULL, -- no definition supplied in QNXT
    [negotiatedterm] ident DEFAULT (' ') NOT NULL, -- no definition supplied in QNXT
    [negotiatedvalue] zmoney DEFAULT (0) NOT NULL, -- Indicates the negotiated value (in either dollars or percentage) based on the term
    [ispatientresp] yesnotype DEFAULT ('N') NOT NULL, -- Determines patient responsibility on negotiated auth contracts.
    [ndcprodname] char(50) DEFAULT (' ') NOT NULL, -- Holds the product name of the NDC group that was selected.
    [appndcgroupname] char(50) DEFAULT (' ') NOT NULL, -- Holds the approved NDC group name when the requested NDC group is downcoded/upcoded
    [interqualid] ident DEFAULT (' ') NOT NULL, -- Inter Qual Identifier
    [meddirectorid] ident DEFAULT (' ') NOT NULL, -- Identifier for a medical director REFERENCES entity(entid)
    [requestedunits] zmoney DEFAULT ((0)) NOT NULL, -- Number of requested units from the 278 transaction
    [svcprocamount] zmoney DEFAULT (0.0000) NOT NULL, -- The dollar amount that is required to perform this procedure
    [initialreferralid] ident NULL, -- 2.4 (135): The one of the initial referral template PK columns used to identify the referral that created this service line
    [initialreferralseq] zint NULL, -- 2.4 (135): The one of the initial referral template PK columns used to identify the referral that created this service line
    [detailsourcetype] char(1) DEFAULT (' ') NOT NULL, -- 2.4 (135): The source type for a system generated referral service line. Values are B: Rebundling and BLANK
    [initialreferraltemplate] yesnotype DEFAULT ('N') NULL, -- 2.4 (135): The one of the initial referral template PK columns used to identify the referral that created this service line
    [dentalareaid] ident DEFAULT (' ') NOT NULL, -- no definition supplied in QNXT
    [downcodesurfacecount] zint NULL, -- no definition supplied in QNXT
    [DeterminationDate] udtshortdate NULL, -- Determination date for each UM service line
    [H278RecordSequence] zint NULL, -- HIPAA 278 record sequence
    [location] char(2) DEFAULT ('') NOT NULL, -- Value representing location
    [Frequency] char(8) DEFAULT ('') NOT NULL, -- Value representing frequency
    [EffDate] smalldatetime DEFAULT ('01/01/1980') NOT NULL, -- Effective date of this record
    [TermDate] smalldatetime DEFAULT ('12/31/2078') NOT NULL, -- Term date of this record
    [ReqEffDate] smalldatetime NULL,
    [ReqTermDate] smalldatetime NULL,
    [decrementtype] char(3) NULL,
    [TotalBudget] zmoney DEFAULT ((0)) NOT NULL,
    [UsedBudget] zmoney DEFAULT ((0)) NOT NULL,
    [ReqTotalBudget] zmoney DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PKauthservice] PRIMARY KEY ([referralid], [sequence], [globaltemplate])
);
