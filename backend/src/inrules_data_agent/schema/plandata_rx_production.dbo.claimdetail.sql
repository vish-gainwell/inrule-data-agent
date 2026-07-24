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
    [claimid] ident NOT NULL, -- Primary key of the claim table | PK marker: X | FK marker: X
    [claimline] zint NOT NULL, -- Claim Detail line number | PK marker: X
    [referralid] char(30) NOT NULL, -- This is not the Primary key of the referral table. 2.6 (005): Expand to char(30). The referralid in this table matches to the referral.authorizationid field. Verified in the ME Lab environment. The custom auth auto-match code populates claimdetail.refe
    [revcode] servicecode NOT NULL, -- Revenue code for the claimdetail line
    [contractid] ident NOT NULL, -- Contract Identifier for the claimdetail lin
    [termid] ident NOT NULL, -- Contractterm Identifier for the claimdetail line
    [planid] ident NOT NULL, -- Plan identifier for the claimdetail line
    [benefitid] ident NOT NULL, -- Benefit Identifier for the claimdetail line
    [servunits] zint NOT NULL, -- Total units billed for a service line
    [total] zmoney NOT NULL, -- Total submitted by provider for reimbursement
    [servcode] servicecode NOT NULL, -- Service code for the claimdetail line
    [modcode] modifiertype NOT NULL, -- Modifier code for the claimdetail line
    [dosfrom] smalldatetime NOT NULL, -- First date of service for the claimdetail line
    [dosto] smalldatetime NOT NULL, -- Second date of service for the claimdetail line
    [location] char(2) NOT NULL, -- Place of Service
    [status] statustype NOT NULL, -- Status of the entry in claimdetail
    [claimamt] zmoney NOT NULL, -- Amount of the claim
    [conteligamt] zmoney NOT NULL, -- Contract Eligible Amount
    [amountpaid] zmoney NOT NULL, -- Amount paid entry in claimdetail
    [deductible] zmoney NOT NULL, -- Deductible amount on the detail line
    [plancrn] char(30) NOT NULL, -- Claim number as assigned by external entity (typically State/Federal agency)
    [contractpaid] zmoney NOT NULL, -- Amount to pay per the provider contract
    [benefitamt] zmoney NOT NULL, -- Benefit amount
    [contractamt] zmoney NOT NULL, -- Contract Amount
    [capitated] zint NOT NULL, -- Indicates that the service was capitated
    [submitdate] smalldatetime NULL, -- Date claim was submitted to external entity
    [plansub] zint NOT NULL, -- NOT USED
    [lastupdate] lastupdatetype NOT NULL, -- Date this record was last updated
    [updateid] udtuserid NOT NULL, -- Id of the user who last updated this record
    [prindiag] udtdiagcode NOT NULL, -- Principle diagnostic code for the claimdetail line
    [emergency] zint NOT NULL, -- Is the claimdetail line associated with an emergency room visit
    [cob] zint NOT NULL, -- Indicates if line item has coordination of benefits. Values 0=no, 1= yes
    [epsdt] zint NOT NULL, -- If set, indicates this service is related to epsdt treatment
    [typesrv] char(2) NOT NULL, -- Type of service
    [ineligibleamt] zmoney NOT NULL, -- Amount claimed that was deemed ineligible
    [createdate] createdatetype NOT NULL, -- Date this record was created
    [createid] udtuserid NOT NULL, -- Id of the user who created this record
    [cobamt] zmoney NOT NULL, -- Amount paid by coordination of benefit carrier
    [userinitials] udtuserid NOT NULL, -- Initials of user that last updated the claimdetail entry
    [copay] zmoney NOT NULL, -- Member's copay for this service
    [adjudicate] zint NOT NULL, -- Adjudication Date of the claim
    [costshareamt] zmoney NOT NULL, -- Member's Costshare for this service
    [costshareper] zmoney NOT NULL, -- Member's cost share % for this service
    [contpercent] zmoney NOT NULL, -- Contract Percentage applied
    [benepercent] zmoney NOT NULL, -- Benefit Percentage paid by plan
    [remvisits] zint NOT NULL, -- Remaining visits
    [maxvisits] zint NOT NULL, -- Maximum number of visits
    [network] ident NOT NULL, -- network with which this provider was affiliated
    [benededuct] zmoney NOT NULL, -- Benefit deductible amount
    [annualaccrual] zmoney NOT NULL, -- Accrued annual benefit amount
    [lifetimeaccrual] zmoney NOT NULL, -- Accrued lifetime amount
    [maxoutaccrual] zmoney NOT NULL, -- Accrued Max out of pocket amount
    [coscode] catservice NOT NULL, -- Category of Service stamp on the claimdetail line
    [catexp] ident NOT NULL, -- Category of expense stamp on the claimdetail record
    [paydiscount] zmoney NOT NULL, -- Pay discount amount
    [subcat] ident NOT NULL, -- Sub Category of Expense code
    [beneinelig] zmoney NOT NULL, -- Benefit ineligible amount
    [riderid] ident NOT NULL, -- Primary key of the rider table | FK marker: X
    [carelevel] char(1) NOT NULL, -- Level of Care provided to LCLAIM members
    [medcoverage] char(1) NOT NULL, -- Medicare coverage for LCLAIM members
    [fracunits] zmoney NOT NULL, -- Fractional Units if applicable for the claimdetail line
    [authunits] zmoney NOT NULL, -- Authorized units
    [poolamt] zmoney NOT NULL, -- Amount applied to risk pool
    [haspool] yesnotype NOT NULL, -- Has pool flag for claimdetail
    [poolid] ident NOT NULL, -- Primary key of the riskpool table | FK marker: X
    [fundid] ident NOT NULL, -- Primary key of the fund table | FK marker: X
    [ffspoolid] ident NOT NULL, -- Fee for service pool identifier
    [ffspoolamt] zmoney NOT NULL, -- Fee for service pool amount
    [toothnumber] toothtype NOT NULL, -- Dental - tooth number for service selected.
    [toothsurface] char(5) NOT NULL, -- Tooth surface description that is covered under this service
    [reimburseamt] zmoney NOT NULL, -- Reimbursement amount
    [billservcode] servicecode NULL, -- Service code that was billed on claim line
    [approvedservcode] servicecode NULL, -- Service code that was approved for claim line
    [refundamt] zmoney NOT NULL, -- Amount refunded for this claim line
    [submitdiscount] zmoney NOT NULL, -- Submission discount for claim line
    [modcode2] modifiertype NOT NULL, -- 2nd Modifier code
    [modcode3] modifiertype NOT NULL, -- 3rd Modifier code
    [addlmemamt] zmoney NOT NULL, -- Additional member amount
    [memamt] zmoney NOT NULL, -- Member amount
    [diag1] char(2) NULL, -- 1st diagnosis code
    [diag2] char(2) NULL, -- 2nd diagnosis code
    [diag3] char(2) NULL, -- 3rd diagnosis code
    [diag4] char(2) NULL, -- 4th diagnosis code
    [globalcovthrudate] smalldatetime NULL, -- This is populated during adjudication and dictates how long it will be until the provider can submit a claim for this member for this service again.
    [modcode4] modifiertype NOT NULL, -- 4th modecode
    [modcode5] modifiertype NOT NULL, -- 5th modecode
    [multmodtiercount] zint NOT NULL, -- Multiple modifier tier count 1 for claim line with a tiered modifier in the modecode column.
    [multmodtiercount2] zint NOT NULL, -- Multiple modifier tier count 2 for claim line with a tiered modifier in the modecode column.
    [multmodtiercount3] zint NOT NULL, -- Multiple modifier tier count 3 for claim line with a tiered modifier in the modecode column.
    [multmodtiercount4] zint NOT NULL, -- Multiple modifier tier count 4 for claim line with a tiered modifier in the modecode column.
    [multmodtiercount5] zint NOT NULL, -- Multiple modifier tier count 5 for claim line with a tiered modifier in the modecode column.
    [coinsuranceamt] zmoney NOT NULL, -- Amount of deference benefitamt and benefit amt * benefit percentage.
    [copayperdiemamt] zmoney NOT NULL, -- Amount of copay perdiem change is applied towards member.
    [ispricebyauth] yesnotype NOT NULL, -- Determines how the claimline is priced: Y: use the authorization contract, term and term amount. N: use standard contract adjudication method
    [cobeligibleamt] zmoney NOT NULL, -- Stores the COB eligible dollar amount
    [medicareactioncode] char(8) NOT NULL, -- Action code for medicare
    [isclaimauthloc] yesnotype NOT NULL, -- Determines if detail record has a claimauthloc record.
    [prioramtpaid] zmoney NOT NULL, -- Prior amount paid on claim.
    [authline] zint NOT NULL, -- Indicates which auth line claim is validating against.
    [redcoinsuranceamt] zmoney NOT NULL, -- Provider specific reduced coinsurance amount per APC pricing system.
    [origbeneclaimid] ident NOT NULL, -- Primary key of the claim table | FK marker: X
    [origbeneadmitdate] smalldatetime NULL, -- Original admit date for the benefit period
    [membmaxfeeamt] zmoney NOT NULL, -- Amount member is responsible to pay that is over the benefit maximum fee
    [paymentapc] char(5) NOT NULL, -- Stores APC codes received from microdyn's APCactive enterprise pricer for enhanced
    [hcpcsapc] char(5) NOT NULL, -- Stores the HCPCS APC code
    [extdeductamt] zmoney NOT NULL, -- External insurance deductable amount. Used in determining secondary payment in QMACS COB process.
    [extcopayamt] zmoney NOT NULL, -- External insurance copay amount. Used in determining secondary payment in QMACS COB process.
    [extcoinsuranceamt] zmoney NOT NULL, -- External insurance coinsurance amount. Used in determining secondary payment in QMACS COB process.
    [extpaidamt] zmoney NOT NULL, -- External insurance paid amount. Used in determining secondary payment in QMACS COB process.
    [allocatedvisits] zmoney NOT NULL, -- Number of visits used for this service line
    [billedunits] zmoney NOT NULL, -- Original billed units submitted on the claim
    [cobsavingsappliedamt] zmoney NOT NULL, -- Stores the COB savings applied to the claimdetail line
    [allowedamt] zmoney NOT NULL, -- Stores the dollar amount used as the allowed amount for the basis of the COB calculation.
    [payasstatus] char(1) NOT NULL, -- Indicates if claimdetail was paid using P - Primary or S - Seconday calculation
    [beneprefid] ident NOT NULL, -- Primary key of the benepreference table
    [employerfeeamt] zmoney NULL, -- Employer Fee Schedule Amt
    [detailsourcetype] char(1) NOT NULL, -- Source type of a claim service line (B) From Claim Check Rebundling (C) From Claim Check Replacement Code
    [penaltyamt] zmoney NOT NULL, -- Non-Compliance Penalty Amount - Member Responsible for
    [cobsavingsamt] zmoney NOT NULL, -- Stores the COB savings accumulated from the line.
    [payasprimary] yesnotype NOT NULL, -- Indicates if system should bypass the COB calculation for a claim line
    [autofillauth] yesnotype NOT NULL, -- Determines if Authorizations will be automatically filled during adjudication
    [provresppenaltyamt] zmoney NOT NULL, -- Non-Compliance Penalty Amount - Provider Responsible for
    [accomodationrate] zmoney NOT NULL, -- Inpatient Rehabilition Facility (IRF) accommodation rate
    [hhppsoutlieramt] zmoney NOT NULL, -- Home health prospective payment system outlier payment amount (calculated).
    [claimsubdetailtype] char(3) NOT NULL, -- Indicates the type of claimsubdetail included in claimdetail LOC = Level of care, BS = Base/Major Medical
    [modcodepreadjud] modifiertype NOT NULL, -- Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ.
    [modcode2preadjud] modifiertype NOT NULL, -- Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ.
    [modcode3preadjud] modifiertype NOT NULL, -- Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ.
    [modcode4preadjud] modifiertype NOT NULL, -- Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ.
    [modcode5preadjud] modifiertype NOT NULL, -- Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ.
    [Usemanualcontrac_x000D_
tprice] yesnotype NOT NULL, -- Value representing usemanualcontractprice
    [Manualcontractprice_x000D_
amt] zmoney NOT NULL, -- Value representing manualcontractpriceamt
    [diag5] char(2) NULL, -- 5th diagnosis code
    [diag6] char(2) NULL, -- 6th diagnosis code
    [diag7] char(2) NULL, -- 7th diagnosis code
    [diag8] char(2) NULL, -- 8th diagnosis code
    [overridecontractpaid] zmoney NOT NULL, -- Overriden contract paid amount
    [overridecontractid] ident NOT NULL, -- Overridden contract id - REFERENCES contract (contractid) | FK marker: X
    [overridetermcontractid] ident NOT NULL, -- Identifier for overridetermcontract | FK marker: X
    [overridecontracttermid] ident NOT NULL, -- Identifier for overridecontractterm | FK marker: X
    [differentialamt] zmoney NOT NULL, -- 2.4 (065): Amount of the differential adjustment
    [startingcontractamt] zmoney NOT NULL, -- 2.4 (065): Amount of provider contract before any adjustments are applied
    [initialclaimid] ident NULL, -- 2.4 (135): The initial claim identifer used to create this service line | FK marker: X
    [initialclaimline] zint NULL, -- 2.4 (135): The initial claim line used to create this service line | FK marker: X
    [umapprovedunits] zmoney NULL, -- 2.6 (010): Stores the number of UM Document approved service units at the time of claim adjudication
    [memrespcharges] yesnotype NOT NULL, -- 2.6 (051): If the member responsibility has been calculated based on charges the this field with contain a value of Y.
    [externalcontractamt] zmoney NULL, -- 2.6 (057): The externally priced contract amount
    [internalcontractamt] zmoney NULL, -- 2.6 (057): The internally priced contract amount
    [copaygroupid] ident NULL, -- 2.6 (070): References copaygroup. Stores the copaygroupid on the claimline if the copay on the claim line is applied using a copay preference group. | FK marker: X
    [hraeligible] yesnotype NOT NULL, -- Value representing hraeligible
    [dentalareaid] ident NULL, -- Identifier for dentalarea | FK marker: X
    [downcodesurfacecount] zint NULL, -- Value representing downcodesurfacecount
    [writeoffamount] zmoney NULL, -- Value representing writeoffamount
    [itspricingmethod] char(2) NULL, -- Value representing itspricingmethod | FK marker: X
    [itspricingrule] char(6) NULL, -- Value representing itspricingrule | FK marker: X
    [itssecpricingrule] char(6) NULL, -- Value representing itssecpricingrule | FK marker: X
    [renderingprovid] ident NULL, -- Identifier for renderingprov | FK marker: X
    [rebillamt] zmoney NULL, -- Rebill amount for the claim line. It is based on 100% of the fee schedule defined on the program for rebill carrier and is an amount field and not a percentage of a fee.
    [anesminutes] zint NULL, -- Number of anesthesia minutes passed in from an imported claim or entered during manual claim entry. On manual claim entry either a datetime span (converted to minutes by app) or the actual minutes can be entered.
    [hasndccode] yesnotype NULL, -- Indicates if this claimdetail records has NDC Code records that are attached to it.
    [dtlmissinginfo] yesnotype NULL, -- Indicates if the claim line is missing information that stopped the claim line from adjudicating successfully.
    [paylimitid] ident NULL, -- Identifier for paylimit
    [ProviderTaxonomyCode] typecode NULL, -- Value representing providertaxonomycode
    [LineItemControlNumber] char(30) NULL, -- Value representing lineitemcontrolnumber
    [ITSMaxReimbFlag] ident NULL, -- Value representing itsmaxreimbflag
    [ITSMaxReimbAmount] zmoney NULL, -- Value representing itsmaxreimbamount
    [ITSContractDefaultFFS_x000D_
Flag] ident NULL, -- Value representing itscontractdefaultffsflag
    [ITSContractDefaultFFS_x000D_
Percent] zmoney NULL, -- Value representing itscontractdefaultffspercent
    [IcdVersion] char(1) NULL, -- Diagnosis ICD Version, '9' for ICD-9 and '0' for ICD-10
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
