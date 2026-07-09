/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: plandata_rx_production
Table: dbo.claim
Primary Key from metadata: claimid
Description: Header-level claim records for pharmacy or medical services.
*/

CREATE TABLE [plandata_rx_production].[dbo].[claim]
(
    [claimid] ident NOT NULL, -- Identifier for claim | PK marker: X
    [referralid] char(30) NOT NULL, -- Identifier for referral
    [enrollid] ident NOT NULL, -- Identifier for enroll | FK marker: X
    [affiliationid] ident NOT NULL, -- Identifier for affiliation | FK marker: X
    [facilitycode] char(1) NOT NULL, -- Value representing facilitycode
    [memid] ident NOT NULL, -- Identifier for mem | FK marker: X
    [billclasscode] char(1) NOT NULL, -- Value representing billclasscode
    [frequencycode] char(1) NOT NULL, -- Value representing frequencycode
    [startdate] smalldatetime NOT NULL, -- Date related to startdate
    [enddate] smalldatetime NOT NULL, -- Date related to enddate
    [controlnmb] char(20) NOT NULL, -- Value representing controlnmb
    [admitdate] smalldatetime NULL, -- Date related to admitdate
    [admithour] zint NOT NULL, -- Value representing admithour
    [medrecnmb] varchar(50) NOT NULL, -- Value representing medrecnmb
    [payer] ident NOT NULL, -- Value representing payer
    [relinfo] char(1) NOT NULL, -- Value representing relinfo
    [admittype] char(1) NOT NULL, -- Value representing admittype
    [asgben] char(1) NOT NULL, -- Value representing asgben
    [admitsource] char(1) NOT NULL, -- Value representing admitsource
    [priorpay] zmoney NOT NULL, -- Value representing priorpay
    [patientstatus] char(2) NOT NULL, -- Status flag indicating patientstatus
    [estamtdue] zmoney NOT NULL, -- Value representing estamtdue
    [esc] ident NOT NULL, -- Value representing esc
    [reason] char(30) NOT NULL, -- Value representing reason
    [plancrn] char(30) NOT NULL, -- Value representing plancrn
    [plansubdate] smalldatetime NULL, -- Date related to plansubdate
    [eligibleamt] zmoney NOT NULL, -- Value representing eligibleamt
    [totaldeduct] zmoney NOT NULL, -- Value representing totaldeduct
    [remitno] ident NOT NULL, -- Value representing remitno
    [adjuddate] smalldatetime NULL, -- Date related to adjuddate
    [logdate] smalldatetime NOT NULL, -- Date related to logdate
    [cleandate] smalldatetime NOT NULL, -- Date related to cleandate
    [orgclaimid] ident NOT NULL, -- Identifier for orgclaim
    [attendphyid] ident NOT NULL, -- Identifier for attendphy
    [resubclaimid] ident NOT NULL, -- Identifier for resubclaim
    [formtype] typecode NOT NULL, -- Value representing formtype
    [plansubmit] zint NOT NULL, -- Value representing plansubmit
    [otherphyid1] ident NOT NULL, -- Value representing otherphyid1
    [lastupdate] lastupdatetype NOT NULL, -- Date and time of the last update
    [otherphyid2] ident NOT NULL, -- Value representing otherphyid2
    [provrep] nametype NOT NULL, -- Value representing provrep
    [updateid] udtuserid NOT NULL, -- Identifier of the user who updated the record
    [createid] udtuserid NOT NULL, -- Identifier of the user who created the record
    [provrepdate] smalldatetime NULL, -- Date related to provrepdate
    [totalamt] zmoney NOT NULL, -- Value representing totalamt
    [createdate] createdatetype NOT NULL, -- Date and time the record was created
    [attendphyname] shortdesctype NOT NULL, -- Value representing attendphyname
    [status] statustype NOT NULL, -- Status flag indicating status
    [planid] ident NOT NULL, -- Identifier for plan | FK marker: X
    [eobamt] zmoney NOT NULL, -- Value representing eobamt
    [eobeligibleamt] zmoney NOT NULL, -- Value representing eobeligibleamt
    [totalpaid] zmoney NOT NULL, -- Identifier for totalpa
    [emergency] zint NOT NULL, -- Value representing emergency
    [contractid] ident NOT NULL, -- Identifier for contract | FK marker: X
    [paiddate] smalldatetime NULL, -- Date related to paiddate
    [drg] servicecode NOT NULL, -- Value representing drg
    [userinitials] udtuserid NOT NULL, -- Value representing userinitials
    [okpaydate] smalldatetime NULL, -- Date related to okpaydate
    [provid] ident NOT NULL, -- Identifier for prov | FK marker: X
    [okpayby] ident NOT NULL, -- Value representing okpayby
    [claimbypcp] zint NOT NULL, -- Value representing claimbypcp
    [shareofcost] zmoney NOT NULL, -- Value representing shareofcost
    [dischargehour] zint NOT NULL, -- Value representing dischargehour
    [haspool] yesnotype NOT NULL, -- Value representing haspool
    [ffspoolid] ident NOT NULL, -- Identifier for ffspool
    [ffspoolamt] zmoney NOT NULL, -- Value representing ffspoolamt
    [outofarea] yesnotype NOT NULL, -- Value representing outofarea
    [covereddays] char(3) NOT NULL, -- Value representing covereddays
    [noncovereddays] char(3) NOT NULL, -- Value representing noncovereddays
    [coinsurancedays] char(3) NOT NULL, -- Value representing coinsurancedays
    [lifereservedays] char(3) NOT NULL, -- Value representing lifereservedays
    [isencounter] yesnotype NOT NULL, -- Value representing isencounter
    [serviceaffilid] ident NOT NULL, -- Identifier for serviceaffil
    [dischargedate] smalldatetime NULL, -- Date related to dischargedate
    [isemployment] yesnotype NOT NULL, -- Value representing isemployment
    [isautoaccident] yesnotype NOT NULL, -- Value representing isautoaccident
    [isotheraccident] yesnotype NOT NULL, -- Value representing isotheraccident
    [dateonset] smalldatetime NULL, -- Date related to dateonset
    [similarillnessdate] smalldatetime NULL, -- Date related to similarillnessdate
    [accidentstate] statetype NOT NULL, -- Value representing accidentstate
    [manualencounter] yesnotype NOT NULL, -- Value representing manualencounter
    [isepsdt] yesnotype NOT NULL, -- Value representing isepsdt
    [initialprothesis] char(1) NOT NULL, -- Value representing initialprothesis
    [priorprothesisdate] smalldatetime NULL, -- Date related to priorprothesisdate
    [isorthodontics] yesnotype NOT NULL, -- Value representing isorthodontics
    [orthoappldate] smalldatetime NULL, -- Date related to orthoappldate
    [orthomosrem] zint NOT NULL, -- Value representing orthomosrem
    [totalreimburseamt] zmoney NOT NULL, -- Value representing totalreimburseamt
    [hasdocuments] yesnotype NOT NULL, -- Value representing hasdocuments
    [referfrom] ident NOT NULL, -- Value representing referfrom
    [isstoploss] yesnotype NOT NULL, -- Value representing isstoploss
    [totalrefundamt] zmoney NOT NULL, -- Value representing totalrefundamt
    [planresub] yesnotype NOT NULL, -- Value representing planresub
    [planresubdate] smalldatetime NULL, -- Date related to planresubdate
    [hascareplan] yesnotype NOT NULL, -- Value representing hascareplan
    [reimbursemember] yesnotype NULL, -- Value representing reimbursemember
    [totalsubmitdiscount] zmoney NOT NULL, -- Value representing totalsubmitdiscount
    [totaladdlmemamt] zmoney NOT NULL, -- Value representing totaladdlmemamt
    [totalmemamt] zmoney NOT NULL, -- Value representing totalmemamt
    [importfinal] statustype NOT NULL, -- Value representing importfinal
    [payeeid] ident NOT NULL, -- Identifier for payee
    [claimsourceid] ident NOT NULL, -- Identifier for claimsource | FK marker: X
    [carryoverintdays] zint NOT NULL, -- Value representing carryoverintdays
    [externalenrollid] ident NOT NULL, -- Identifier for externalenroll
    [paycobbyline] char(1) NOT NULL, -- Value representing paycobbyline
    [totextdeductamt] zmoney NOT NULL, -- Value representing totextdeductamt
    [totextcopayamt] zmoney NOT NULL, -- Value representing totextcopayamt
    [totextcoinsuranceamt] zmoney NOT NULL, -- Value representing totextcoinsuranceamt
    [totextpaidamt] zmoney NOT NULL, -- Value representing totextpaidamt
    [interestdays] zint NOT NULL, -- Value representing interestdays
    [cobsavings] zmoney NOT NULL, -- Value representing cobsavings
    [isitsclaim] char(1) NOT NULL, -- Value representing isitsclaim
    [forcedbeneprefid] ident NOT NULL, -- Identifier for forcedbenepref | FK marker: X
    [adjudbeneprefid] ident NOT NULL, -- Identifier for adjudbenepref | FK marker: X
    [determiningclaimid] ident NOT NULL, -- Identifier for determiningclaim | FK marker: X
    [eobreceived] yesnotype NOT NULL, -- Value representing eobreceived
    [isbasesupplemental] yesnotype NOT NULL, -- Value representing isbasesupplemental
    [privacypayeeid] ident NOT NULL, -- Identifier for privacypayee | FK marker: X
    [suppresseob] yesnotype NOT NULL, -- Value representing suppresseob
    [cobsavingsapplied] zmoney NOT NULL, -- Value representing cobsavingsapplied
    [calccobbyline] char(1) NOT NULL, -- Value representing calccobbyline
    [haslien] yesnotype NOT NULL, -- Value representing haslien
    [hasrefundrequest] yesnotype NOT NULL, -- Value representing hasrefundrequest
    [mspclaim] yesnotype NOT NULL, -- Value representing mspclaim
    [msppayeeid] ident NOT NULL, -- Identifier for msppayee | FK marker: X
    [reimbursemedicareamt] zmoney NOT NULL, -- Value representing reimbursemedicareamt
    [reject] yesnotype NOT NULL, -- Value representing reject
    [reimbursecopayamt] zmoney NOT NULL, -- Value representing reimbursecopayamt
    [mempaidamt] zmoney NOT NULL, -- Value representing mempaidamt
    [exportdate837] smalldatetime NULL, -- Date related to exportdate837
    [externalpricing] yesnotype NULL, -- Value representing externalpricing
    [importdate837] smalldatetime NULL, -- Date related to importdate837
    [externaldcn] varchar(50) NULL, -- Value representing externaldcn
    [networkaffilid] ident NULL, -- Identifier for networkaffil
    [doshragrporgpolid] ident NULL, -- Identifier for doshragrporgpol | FK marker: X
    [currhragrporgpolid] ident NULL, -- Identifier for currhragrporgpol | FK marker: X
    [primaryclaimid] ident NULL, -- Identifier for primaryclaim | FK marker: X
    [outlierid] ident NULL, -- Identifier for outlier | FK marker: X
    [nonmember] char(2) NULL, -- Value representing nonmember
    [mhbstatus] char(1) NULL, -- Status flag indicating mhbstatus
    [isrepricingclaim] yesnotype NULL, -- Value representing isrepricingclaim
    [rebilltotalamt] zmoney NULL, -- Value representing rebilltotalamt
    [rebillreleasedate] udtshortdate NULL, -- Date related to rebillreleasedate
    [otherphyid1name] varchar(60) NULL, -- Value representing otherphyid1name
    [otherphyid2name] varchar(60) NULL, -- Value representing otherphyid2name
    [voidreasonid] ident NULL, -- Identifier for voidreason | FK marker: X
    [missinginformation] yesnotype NULL, -- Value representing missinginformation
    [contractnetworkid] ident NULL, -- Identifier for contractnetwork
    [formcreationdate] udtlongdate NULL, -- Date related to formcreationdate
    [billtypeprefix] char(1) NULL, -- Value representing billtypeprefix
    [isltc] yesnotype NULL, -- Value representing isltc
    [BenefitsAssignment] char(1) NULL, -- Value representing benefitsassignment
    [ProviderTaxonomyCode] typecode NULL, -- Value representing providertaxonomycode
    [DeceasedDate] udtshortdate NULL, -- Date related to deceaseddate
    [NoWorkFromDate] smalldatetime NULL, -- Date related to noworkfromdate
    [NoWorkToDate] smalldatetime NULL, -- Date related to noworktodate
    [SignatureOnFile] char(1) NULL, -- Value representing signatureonfile
    [SpecialProgramCode] typecode NULL, -- Value representing specialprogramcode
    [EOBRequested] yesnotype NULL, -- Value representing eobrequested
    [COBPaidDate] udtlongdate NULL, -- Date related to cobpaiddate
    [copcid] ident NULL, -- Identifier for copc | FK marker: X
    [ProviderParStatus] char(1) NULL, -- Status flag indicating providerparstatus
    [CobLessorAmtMethod_x000D_
Applied] zint NULL, -- Value representing coblessoramtmethodapplied
    [MedicareCrossover_x000D_
Indicator] varchar(10) NULL, -- Value representing medicarecrossoverindicator
    [Dcn] varchar(30) NULL, -- Value representing dcn
    [ExternalFinancialStatus] varchar(25) NULL, -- Status flag indicating externalfinancialstatus
    [MergeFromEnrollId] ident NULL, -- Identifier for mergefromenroll
    [TotMemSpendDown] zmoney NULL, -- Value representing totmemspenddown
    [IsNxPbaClaim] yesnotype NULL, -- Value representing isnxpbaclaim
    [NxPbaPatientEventId] int NULL, -- Identifier for nxpbapatientevent
    [ExternalClaimId] varchar(30) NULL, -- Identifier for externalclaim
    [IsBundled] yesnotype NULL, -- Value representing isbundled
    [admitminute] zint NOT NULL, -- Value representing admitminute
    [dischargeminute] zint NOT NULL, -- Value representing dischargeminute
    CONSTRAINT [PK_claim] PRIMARY KEY ([claimid])
);

/*
Columns marked as FK in DED workbook. Referenced tables were not available in this derived source.
- enrollid
- affiliationid
- memid
- planid
- contractid
- provid
- claimsourceid
- forcedbeneprefid
- adjudbeneprefid
- determiningclaimid
- privacypayeeid
- msppayeeid
- doshragrporgpolid
- currhragrporgpolid
- primaryclaimid
- outlierid
- voidreasonid
- copcid
*/
