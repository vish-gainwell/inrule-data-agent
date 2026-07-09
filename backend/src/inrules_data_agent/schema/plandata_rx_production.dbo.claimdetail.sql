/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: plandata_rx_production
Table: dbo.claimdetail
Primary Key from metadata: claimid, claimline
Description: Line-level details for services, drugs, or procedures on a claim.
*/

CREATE TABLE [plandata_rx_production].[dbo].[claimdetail]
(
    [claimid] ident NOT NULL, -- Identifier for claim | PK marker: X | FK marker: X
    [claimline] zint NOT NULL, -- Value representing claimline | PK marker: X
    [referralid] char(30) NOT NULL, -- Identifier for referral
    [revcode] servicecode NOT NULL, -- Value representing revcode
    [contractid] ident NOT NULL, -- Identifier for contract
    [termid] ident NOT NULL, -- Identifier for term
    [planid] ident NOT NULL, -- Identifier for plan
    [benefitid] ident NOT NULL, -- Identifier for benefit
    [servunits] zint NOT NULL, -- Value representing servunits
    [total] zmoney NOT NULL, -- Value representing total
    [servcode] servicecode NOT NULL, -- Value representing servcode
    [modcode] modifiertype NOT NULL, -- Value representing modcode
    [dosfrom] smalldatetime NOT NULL, -- Value representing dosfrom
    [dosto] smalldatetime NOT NULL, -- Value representing dosto
    [location] char(2) NOT NULL, -- Value representing location
    [status] statustype NOT NULL, -- Status flag indicating status
    [claimamt] zmoney NOT NULL, -- Value representing claimamt
    [conteligamt] zmoney NOT NULL, -- Value representing conteligamt
    [amountpaid] zmoney NOT NULL, -- Identifier for amountpa
    [deductible] zmoney NOT NULL, -- Value representing deductible
    [plancrn] char(30) NOT NULL, -- Value representing plancrn
    [contractpaid] zmoney NOT NULL, -- Identifier for contractpa
    [benefitamt] zmoney NOT NULL, -- Value representing benefitamt
    [contractamt] zmoney NOT NULL, -- Value representing contractamt
    [capitated] zint NOT NULL, -- Value representing capitated
    [submitdate] smalldatetime NULL, -- Date related to submitdate
    [plansub] zint NOT NULL, -- Value representing plansub
    [lastupdate] lastupdatetype NOT NULL, -- Date and time of the last update
    [updateid] udtuserid NOT NULL, -- Identifier of the user who updated the record
    [prindiag] udtdiagcode NOT NULL, -- Value representing prindiag
    [emergency] zint NOT NULL, -- Value representing emergency
    [cob] zint NOT NULL, -- Value representing cob
    [epsdt] zint NOT NULL, -- Value representing epsdt
    [typesrv] char(2) NOT NULL, -- Value representing typesrv
    [ineligibleamt] zmoney NOT NULL, -- Value representing ineligibleamt
    [createdate] createdatetype NOT NULL, -- Date and time the record was created
    [createid] udtuserid NOT NULL, -- Identifier of the user who created the record
    [cobamt] zmoney NOT NULL, -- Value representing cobamt
    [userinitials] udtuserid NOT NULL, -- Value representing userinitials
    [copay] zmoney NOT NULL, -- Value representing copay
    [adjudicate] zint NOT NULL, -- Value representing adjudicate
    [costshareamt] zmoney NOT NULL, -- Value representing costshareamt
    [costshareper] zmoney NOT NULL, -- Value representing costshareper
    [contpercent] zmoney NOT NULL, -- Value representing contpercent
    [benepercent] zmoney NOT NULL, -- Value representing benepercent
    [remvisits] zint NOT NULL, -- Value representing remvisits
    [maxvisits] zint NOT NULL, -- Value representing maxvisits
    [network] ident NOT NULL, -- Value representing network
    [benededuct] zmoney NOT NULL, -- Value representing benededuct
    [annualaccrual] zmoney NOT NULL, -- Value representing annualaccrual
    [lifetimeaccrual] zmoney NOT NULL, -- Value representing lifetimeaccrual
    [maxoutaccrual] zmoney NOT NULL, -- Value representing maxoutaccrual
    [coscode] catservice NOT NULL, -- Value representing coscode
    [catexp] ident NOT NULL, -- Value representing catexp
    [paydiscount] zmoney NOT NULL, -- Value representing paydiscount
    [subcat] ident NOT NULL, -- Value representing subcat
    [beneinelig] zmoney NOT NULL, -- Value representing beneinelig
    [riderid] ident NOT NULL, -- Identifier for rider | FK marker: X
    [carelevel] char(1) NOT NULL, -- Value representing carelevel
    [medcoverage] char(1) NOT NULL, -- Value representing medcoverage
    [fracunits] zmoney NOT NULL, -- Value representing fracunits
    [authunits] zmoney NOT NULL, -- Value representing authunits
    [poolamt] zmoney NOT NULL, -- Value representing poolamt
    [haspool] yesnotype NOT NULL, -- Value representing haspool
    [poolid] ident NOT NULL, -- Identifier for pool | FK marker: X
    [fundid] ident NOT NULL, -- Identifier for fund | FK marker: X
    [ffspoolid] ident NOT NULL, -- Identifier for ffspool
    [ffspoolamt] zmoney NOT NULL, -- Value representing ffspoolamt
    [toothnumber] toothtype NOT NULL, -- Value representing toothnumber
    [toothsurface] char(5) NOT NULL, -- Value representing toothsurface
    [reimburseamt] zmoney NOT NULL, -- Value representing reimburseamt
    [billservcode] servicecode NULL, -- Value representing billservcode
    [approvedservcode] servicecode NULL, -- Value representing approvedservcode
    [refundamt] zmoney NOT NULL, -- Value representing refundamt
    [submitdiscount] zmoney NOT NULL, -- Value representing submitdiscount
    [modcode2] modifiertype NOT NULL, -- Value representing modcode2
    [modcode3] modifiertype NOT NULL, -- Value representing modcode3
    [addlmemamt] zmoney NOT NULL, -- Value representing addlmemamt
    [memamt] zmoney NOT NULL, -- Value representing memamt
    [diag1] char(2) NULL, -- Value representing diag1
    [diag2] char(2) NULL, -- Value representing diag2
    [diag3] char(2) NULL, -- Value representing diag3
    [diag4] char(2) NULL, -- Value representing diag4
    [globalcovthrudate] smalldatetime NULL, -- Date related to globalcovthrudate
    [modcode4] modifiertype NOT NULL, -- Value representing modcode4
    [modcode5] modifiertype NOT NULL, -- Value representing modcode5
    [multmodtiercount] zint NOT NULL, -- Value representing multmodtiercount
    [multmodtiercount2] zint NOT NULL, -- Value representing multmodtiercount2
    [multmodtiercount3] zint NOT NULL, -- Value representing multmodtiercount3
    [multmodtiercount4] zint NOT NULL, -- Value representing multmodtiercount4
    [multmodtiercount5] zint NOT NULL, -- Value representing multmodtiercount5
    [coinsuranceamt] zmoney NOT NULL, -- Value representing coinsuranceamt
    [copayperdiemamt] zmoney NOT NULL, -- Value representing copayperdiemamt
    [ispricebyauth] yesnotype NOT NULL, -- Value representing ispricebyauth
    [cobeligibleamt] zmoney NOT NULL, -- Value representing cobeligibleamt
    [medicareactioncode] char(8) NOT NULL, -- Value representing medicareactioncode
    [isclaimauthloc] yesnotype NOT NULL, -- Value representing isclaimauthloc
    [prioramtpaid] zmoney NOT NULL, -- Identifier for prioramtpa
    [authline] zint NOT NULL, -- Value representing authline
    [redcoinsuranceamt] zmoney NOT NULL, -- Value representing redcoinsuranceamt
    [origbeneclaimid] ident NOT NULL, -- Identifier for origbeneclaim | FK marker: X
    [origbeneadmitdate] smalldatetime NULL, -- Date related to origbeneadmitdate
    [membmaxfeeamt] zmoney NOT NULL, -- Value representing membmaxfeeamt
    [paymentapc] char(5) NOT NULL, -- Value representing paymentapc
    [hcpcsapc] char(5) NOT NULL, -- Value representing hcpcsapc
    [extdeductamt] zmoney NOT NULL, -- Value representing extdeductamt
    [extcopayamt] zmoney NOT NULL, -- Value representing extcopayamt
    [extcoinsuranceamt] zmoney NOT NULL, -- Value representing extcoinsuranceamt
    [extpaidamt] zmoney NOT NULL, -- Value representing extpaidamt
    [allocatedvisits] zmoney NOT NULL, -- Value representing allocatedvisits
    [billedunits] zmoney NOT NULL, -- Value representing billedunits
    [cobsavingsappliedamt] zmoney NOT NULL, -- Value representing cobsavingsappliedamt
    [allowedamt] zmoney NOT NULL, -- Value representing allowedamt
    [payasstatus] char(1) NOT NULL, -- Status flag indicating payasstatus
    [beneprefid] ident NOT NULL, -- Identifier for benepref
    [employerfeeamt] zmoney NULL, -- Value representing employerfeeamt
    [detailsourcetype] char(1) NOT NULL, -- Value representing detailsourcetype
    [penaltyamt] zmoney NOT NULL, -- Value representing penaltyamt
    [cobsavingsamt] zmoney NOT NULL, -- Value representing cobsavingsamt
    [payasprimary] yesnotype NOT NULL, -- Value representing payasprimary
    [autofillauth] yesnotype NOT NULL, -- Value representing autofillauth
    [provresppenaltyamt] zmoney NOT NULL, -- Value representing provresppenaltyamt
    [accomodationrate] zmoney NOT NULL, -- Value representing accomodationrate
    [hhppsoutlieramt] zmoney NOT NULL, -- Value representing hhppsoutlieramt
    [claimsubdetailtype] char(3) NOT NULL, -- Value representing claimsubdetailtype
    [modcodepreadjud] modifiertype NOT NULL, -- Value representing modcodepreadjud
    [modcode2preadjud] modifiertype NOT NULL, -- Value representing modcode2preadjud
    [modcode3preadjud] modifiertype NOT NULL, -- Value representing modcode3preadjud
    [modcode4preadjud] modifiertype NOT NULL, -- Value representing modcode4preadjud
    [modcode5preadjud] modifiertype NOT NULL, -- Value representing modcode5preadjud
    [Usemanualcontrac_x000D_
tprice] yesnotype NOT NULL, -- Value representing usemanualcontractprice
    [Manualcontractprice_x000D_
amt] zmoney NOT NULL, -- Value representing manualcontractpriceamt
    [diag5] char(2) NULL, -- Value representing diag5
    [diag6] char(2) NULL, -- Value representing diag6
    [diag7] char(2) NULL, -- Value representing diag7
    [diag8] char(2) NULL, -- Value representing diag8
    [overridecontractpaid] zmoney NOT NULL, -- Identifier for overridecontractpa
    [overridecontractid] ident NOT NULL, -- Identifier for overridecontract | FK marker: X
    [overridetermcontractid] ident NOT NULL, -- Identifier for overridetermcontract | FK marker: X
    [overridecontracttermid] ident NOT NULL, -- Identifier for overridecontractterm | FK marker: X
    [differentialamt] zmoney NOT NULL, -- Value representing differentialamt
    [startingcontractamt] zmoney NOT NULL, -- Value representing startingcontractamt
    [initialclaimid] ident NULL, -- Identifier for initialclaim | FK marker: X
    [initialclaimline] zint NULL, -- Value representing initialclaimline | FK marker: X
    [umapprovedunits] zmoney NULL, -- Value representing umapprovedunits
    [memrespcharges] yesnotype NOT NULL, -- Value representing memrespcharges
    [externalcontractamt] zmoney NULL, -- Value representing externalcontractamt
    [internalcontractamt] zmoney NULL, -- Value representing internalcontractamt
    [copaygroupid] ident NULL, -- Identifier for copaygroup | FK marker: X
    [hraeligible] yesnotype NOT NULL, -- Value representing hraeligible
    [dentalareaid] ident NULL, -- Identifier for dentalarea | FK marker: X
    [downcodesurfacecount] zint NULL, -- Value representing downcodesurfacecount
    [writeoffamount] zmoney NULL, -- Value representing writeoffamount
    [itspricingmethod] char(2) NULL, -- Value representing itspricingmethod | FK marker: X
    [itspricingrule] char(6) NULL, -- Value representing itspricingrule | FK marker: X
    [itssecpricingrule] char(6) NULL, -- Value representing itssecpricingrule | FK marker: X
    [renderingprovid] ident NULL, -- Identifier for renderingprov | FK marker: X
    [rebillamt] zmoney NULL, -- Value representing rebillamt
    [anesminutes] zint NULL, -- Value representing anesminutes
    [hasndccode] yesnotype NULL, -- Value representing hasndccode
    [dtlmissinginfo] yesnotype NULL, -- Value representing dtlmissinginfo
    [paylimitid] ident NULL, -- Identifier for paylimit
    [ProviderTaxonomyCode] typecode NULL, -- Value representing providertaxonomycode
    [LineItemControlNumber] char(30) NULL, -- Value representing lineitemcontrolnumber
    [ITSMaxReimbFlag] ident NULL, -- Value representing itsmaxreimbflag
    [ITSMaxReimbAmount] zmoney NULL, -- Value representing itsmaxreimbamount
    [ITSContractDefaultFFS_x000D_
Flag] ident NULL, -- Value representing itscontractdefaultffsflag
    [ITSContractDefaultFFS_x000D_
Percent] zmoney NULL, -- Value representing itscontractdefaultffspercent
    [IcdVersion] char(1) NULL, -- Value representing icdversion
    [CoverageCodeId] ident NULL, -- Identifier for coveragecode | FK marker: X
    [ExternalFinancialStatus] varchar(25) NULL, -- Status flag indicating externalfinancialstatus
    [MemSpendDown] zmoney NULL, -- Value representing memspenddown
    [ItsInclusiveGrouping] char(2) NULL, -- Value representing itsinclusivegrouping
    [Rebateable] yesnotype NOT NULL, -- Value representing rebateable
    [PreBundledAmount] zmoney NULL, -- Value representing prebundledamount
    [SOCTypeId] ident NOT NULL, -- Identifier for soctype | FK marker: X
    [SOCTypeAmount] zmoney NOT NULL, -- Value representing soctypeamount
    [GlobalCovFromDate] smalldatetime NULL, -- Date related to globalcovfromdate
    [OutputCaseLineID] char(15) NULL, -- Identifier for outputcaseline
    CONSTRAINT [PK_claimdetail] PRIMARY KEY ([claimid], [claimline])
);

/*
Columns marked as FK in DED workbook. Referenced tables were not available in this derived source.
- claimid
- riderid
- poolid
- fundid
- origbeneclaimid
- overridecontractid
- overridetermcontractid
- overridecontracttermid
- initialclaimid
- initialclaimline
- copaygroupid
- dentalareaid
- itspricingmethod
- itspricingrule
- itssecpricingrule
- renderingprovid
- CoverageCodeId
- SOCTypeId
*/
