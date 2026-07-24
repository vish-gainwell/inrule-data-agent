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
    [claimid] ident NOT NULL, -- Primary key of the claim table. This can be auto populated by idsequencer or entered by a user. | PK marker: X
    [referralid] char(30) NOT NULL, -- This is the referral/prior auth that was given before the member received services. This will only be populated on claims that had referrals. Links to referral.referralid
    [enrollid] ident NOT NULL, -- The enrollid of the member that will be used to calculate the benefits for this member for the specific claim. Links to enrollment.enrollid | FK marker: X
    [affiliationid] ident NOT NULL, -- Specifies the pay to provider for the claim. Links to affiliation.affiliationid and then to provider on affiliateid. Displays the provider name. | FK marker: X
    [facilitycode] char(1) NOT NULL, -- Provides specific information about the hospital bill. The first digit of the three digit number identifies the type of facility. The second digit classifies the type of care being billed. The third digit indicates the sequence of the bill for a specific
    [memid] ident NOT NULL, -- The memberid of the person the claim is for. This links back to member.memid. | FK marker: X
    [billclasscode] char(1) NOT NULL, -- Provides specific information about the hospital bill. The first digit of the three digit number identifies the type of facility. The second digit classifies the type of care being billed. The third digit indicates the sequence of the bill for a specific
    [frequencycode] char(1) NOT NULL, -- Provides specific information about the hospital bill. The first digit of the three digit number identifies the type of facility. The second digit classifies the type of care being billed. The third digit indicates the sequence of the bill for a specific
    [startdate] smalldatetime NOT NULL, -- Dates service began for this claim. All claimdetail records for this claim must be between this date and the end date.
    [enddate] smalldatetime NOT NULL, -- Last date of service was given for this claim. All claimdetail records for this claim must be between this date and the end date.
    [controlnmb] char(20) NOT NULL, -- Field is a user defined field usually used by providers as a patient billing number.
    [admitdate] smalldatetime NULL, -- Admission date for entry in claim
    [admithour] zint NOT NULL, -- Hour of patient admission
    [medrecnmb] varchar(50) NOT NULL, -- Number assigned by the provider to the patients medical of health record. QNXT 3.6 Expanded to char(30) for UB04
    [payer] ident NOT NULL, -- NOT USED : Name of Payer (health Plan)
    [relinfo] char(1) NOT NULL, -- Flag saying if information can be released for the member.
    [admittype] char(1) NOT NULL, -- Admission Type on UB92 : Indicates the priority of the inpatient admission.
    [asgben] char(1) NOT NULL, -- Assigned benefits check box on claim . 2.4 (070): Changed default to 'N' (Also Rolled back to 2.0)
    [admitsource] char(1) NOT NULL, -- Admission Source on UB92, indicates the source of the admission or outpatient service
    [priorpay] zmoney NOT NULL, -- Prior Payments made by member/plan
    [patientstatus] char(2) NOT NULL, -- Indicates patients disposition as of the ending date of service for the period of care reported
    [estamtdue] zmoney NOT NULL, -- NOT USED : Estimated amount due on claim form
    [esc] ident NOT NULL, -- User defined field and can be used as a reinsurance number
    [reason] char(30) NOT NULL, -- User defined field. Free form entry.
    [plancrn] char(30) NOT NULL, -- Claim number as assigned by external entity (typically State/Federal agency)
    [plansubdate] smalldatetime NULL, -- NOT USED : Date the claim was submitted to external organization
    [eligibleamt] zmoney NOT NULL, -- Total dollar amount that is eligible for the claim.
    [totaldeduct] zmoney NOT NULL, -- Total deductible from the sum of the deductibles of the claimdetail lines. Calculated during adjudication
    [remitno] ident NOT NULL, -- Remit number associated with claim. Populated when you run remits.
    [adjuddate] smalldatetime NULL, -- Adjudication Date of the claim
    [logdate] smalldatetime NOT NULL, -- The date the claim was logged for processing. This field is used to calculate quick pay discounts/ late pay surcharges (If applied to the contract). The pay date (Date FFS payment is generated) less the claim.logdate calculates the number of days for this
    [cleandate] smalldatetime NOT NULL, -- Date a claim becomes ready for processing with no additional documents required.
    [orgclaimid] ident NOT NULL, -- Original claimid. This is placed on the claim you are reversing from.
    [attendphyid] ident NOT NULL, -- Attending provider identifier. Foreign key to provider
    [resubclaimid] ident NOT NULL, -- If claim is reversed, this field will contain the ID of the claim reversal
    [formtype] typecode NOT NULL, -- Type of claim form being utilized for the claim.This is generally defined by the providers provider type definition. (Claimtype field in the providertype table)
    [plansubmit] zint NOT NULL, -- For reporting only and will send an encounter report to the line of business. Values 1=Yes, 0= No
    [otherphyid1] ident NOT NULL, -- NOT USED : Additional provider identifier
    [lastupdate] lastupdatetype NOT NULL, -- Date this record was last updated
    [otherphyid2] ident NOT NULL, -- NOT USED : Additional provider2 identifier
    [provrep] nametype NOT NULL, -- NOT USED : Provider Representative
    [updateid] udtuserid NOT NULL, -- Id of the user who last updated this record
    [createid] udtuserid NOT NULL, -- Id of the user who created this record
    [provrepdate] smalldatetime NULL, -- NOT USED : Provider Submission Date
    [totalamt] zmoney NOT NULL, -- This field indicates the total amount of charges on the claim form
    [createdate] createdatetype NOT NULL, -- Date this record was created
    [attendphyname] shortdesctype NOT NULL, -- Identifies the name of the licensed physician who normally is expected to certify and recertify medical necessity of the services rendered and / or has the primary responsibility for the patients medical care and treatment
    [status] statustype NOT NULL, -- Status of the claim. (I.E. Log, Open, Adjudicated, Pend, Pay, Deny, Reverse, Waitpay, Waitdeny, Waitrev, Paid, Denied, and Reversed, etc)
    [planid] ident NOT NULL, -- The benefit plan that the member has. This is populated from the enrollment.planid field. This will be used in calculating the members benefits. | FK marker: X
    [eobamt] zmoney NOT NULL, -- Amount submitted as coordination of benefits dollar amount. Will be calculated based on system setup.
    [eobeligibleamt] zmoney NOT NULL, -- Dollar amount eligible for payment after applying cob amount
    [totalpaid] zmoney NOT NULL, -- Total paid on the claim. Is populated when adjudication is run. This is not displayed on the Claim Summary screen even though the UI says Total Paid. It is on the Pay tab.
    [emergency] zint NOT NULL, -- NOT USED : MOVED TO CLAIMDETAIL RECORD : Indicates claim is for an emergency situation
    [contractid] ident NOT NULL, -- The contract that is associated with the paytoprovider. This contract information will be used to calculate the contract dollars for the claim | FK marker: X
    [paiddate] smalldatetime NULL, -- Dater the claim completed the payment process. The field is only visible after the claim has been processed through create FFS Payment. Field will remain null until payment is processed.
    [drg] servicecode NOT NULL, -- Diagnostic Related Grouping code submitted by hospital for Medicare reimubursement
    [userinitials] udtuserid NOT NULL, -- NOT USED : Initials of user that last updated the claim entry
    [okpaydate] smalldatetime NULL, -- Date the claim was marked ok to move through payment process. This field is only visible after the claim has been marked OK.
    [provid] ident NOT NULL, -- Provider id of the provider submitting the claim. | FK marker: X
    [okpayby] ident NOT NULL, -- Login of the user that marked the claim ok to move through payment process
    [claimbypcp] zint NOT NULL, -- Flag used to determine if claim was submitted by the members PCP. This is calculated by matching the provid and memid to the memberpcp table. Values '0' = No , '1' = Yes , '-1' = Yes
    [shareofcost] zmoney NOT NULL, -- Member's share of cost for this claim (LCLAIM claims ONLY)
    [dischargehour] zint NOT NULL, -- The hour during which the patient was discharged from inpatient care
    [haspool] yesnotype NOT NULL, -- If the member has a pool associated with the contract then this will be set to yes. Set during adjudication. Values 'N' = No, 'Y' = Yes
    [ffspoolid] ident NOT NULL, -- The risk poolid (riskpool.riskpoolid) associated with this claim and it is only populated when the ffs risk pool is defined at the contract level. If riskpools are defined at the contract term level the risk pools are only available at the claim line lev
    [ffspoolamt] zmoney NOT NULL, -- Sum of the FFS pool amount on the claim line (claimdetail.ffspoolamt)
    [outofarea] yesnotype NOT NULL, -- Will indicate that the claim is out of normal service area. Values "Y" = Yes, "N" = No
    [covereddays] char(3) NOT NULL, -- Number of inpatient days covered by the primary payer
    [noncovereddays] char(3) NOT NULL, -- Number of days of care NOT covered by the primary payer
    [coinsurancedays] char(3) NOT NULL, -- Inpatient MEDICARE days occurring after the 60th day and before the 91st day in a single spell of illness.
    [lifereservedays] char(3) NOT NULL, -- Under MEDICARE, each beneficiary has a lifetime reserve of 60 days of inpatient hospital services after using 90 days of inpatient hospital services during a spell of illness.
    [isencounter] yesnotype NOT NULL, -- If selected will set services to capitated. It will override the contract even if there are FFS lines. Values "Y" = Yes, "N" = No
    [serviceaffilid] ident NOT NULL, -- The facility that the service is being provided at. This may not be necessary on all claims
    [dischargedate] smalldatetime NULL, -- If services submitted in this claim were performed while the patient was confined in a health care facility, the ending date of confinement
    [isemployment] yesnotype NOT NULL, -- A yes/no field to indicate whether the patient alleges that his/her medical condition is due to the environment or events resulting from employment
    [isautoaccident] yesnotype NOT NULL, -- A yes/no field to indicate whether the patient's condition was the result of an auto accident
    [isotheraccident] yesnotype NOT NULL, -- A yes/no field to indicate whether the patient's condition was the result of other, non-auto accident
    [dateonset] smalldatetime NULL, -- Date the illness or injury happened or started.
    [similarillnessdate] smalldatetime NULL, -- The previous date that the patient experienced symptoms similar or identical to those for which services submitted on this claim were rendered
    [accidentstate] statetype NOT NULL, -- State Postal Code identifying the state in which the automobile accident occurred
    [manualencounter] yesnotype NOT NULL, -- Indicates If the user verifies that this was not a manual encounter. Values 'Y' Yes, 'N' no
    [isepsdt] yesnotype NOT NULL, -- NOT USED : MOVED TO CLAIMDETAIL : Is epsdt flag
    [initialprothesis] char(1) NOT NULL, -- Determines if I-Initial or R-Replacement of prothesis
    [priorprothesisdate] smalldatetime NULL, -- Date of prior prothesis
    [isorthodontics] yesnotype NOT NULL, -- Indicates of claim is orthodontic related
    [orthoappldate] smalldatetime NULL, -- Date orthodontics were applied
    [orthomosrem] zint NOT NULL, -- Dental - Number of months remaining in treatment
    [totalreimburseamt] zmoney NOT NULL, -- Total reimbursement dollar amount. Calculated during adjudication
    [hasdocuments] yesnotype NOT NULL, -- Indicates that documents were submitted with this claim.
    [referfrom] ident NOT NULL, -- This is the provid of the physician the member was referred from. This links to provider.provid.
    [isstoploss] yesnotype NOT NULL, -- Selected to indicate if there is stop loss associated with the claim. (Y/N)
    [totalrefundamt] zmoney NOT NULL, -- Total dollar amount refunded by the provider during a reversal.
    [planresub] yesnotype NOT NULL, -- Indicates that claim should be resubmitted to carrier to reflect adjustment
    [planresubdate] smalldatetime NULL, -- Date that claim was resubmitted to carrier. Comes from the claim.startdate field of the claim that is listed on the original claim in the claim.resubclaimid field.
    [hascareplan] yesnotype NOT NULL, -- Indicatees if a careplan exits for claim
    [reimbursemember] yesnotype NULL, -- If selected will pay the member rather than the provider.
    [totalsubmitdiscount] zmoney NOT NULL, -- Total discounts based on dollar amount submitted and quick pays,
    [totaladdlmemamt] zmoney NOT NULL, -- How much more the member is responsible to pay. Calculated during adjudicate. Done on manual pricing.
    [totalmemamt] zmoney NOT NULL, -- How much the member is responsible for our of total claim. This includes copay's and deductibles.
    [importfinal] statustype NOT NULL, -- NOT USED
    [payeeid] ident NOT NULL, -- NOT USED : For alternate payment purposes this will be the memberid of the member that will be paid for this claim.
    [claimsourceid] ident NOT NULL, -- Stores where claim was created from. Manual entry or EDI | FK marker: X
    [carryoverintdays] zint NOT NULL, -- Stores the number of days for interest calculations to be carried over from a claim that has been denied to an adjustment claim
    [externalenrollid] ident NOT NULL, -- External COB enrollment attached to the claim. Defines relationship and type of COB being processed in adjudication which effects the COB calculation
    [paycobbyline] char(1) NOT NULL, -- If (Y)es then adjudication will calculate and pay the COB on a line by line basis. If (N)O then adjudication will calculate and pay the COB on a claim basis.
    [totextdeductamt] zmoney NOT NULL, -- Total claim external insurance deductable amount. Used in determining secondary payment in COB process.
    [totextcopayamt] zmoney NOT NULL, -- Total claim external insurance copay amount. Used in determining secondary payment in QMACS COB process.
    [totextcoinsuranceamt] zmoney NOT NULL, -- Total claim external insurance coinsurance amount. Used in determining secondary payment in QMACS COB process.
    [totextpaidamt] zmoney NOT NULL, -- Total claim external insurance paid amount. Used in determining secondary payment in QMACS COB process. COB Screen-Total Paid Amount
    [interestdays] zint NOT NULL, -- The number of days used to calculate interest.
    [cobsavings] zmoney NOT NULL, -- Holds the COB Savings generated as a result of the claim dental lines in this claim
    [isitsclaim] char(1) NOT NULL, -- Used to determine if a claim is an ITS claim (N)o - Isn't an ITS Claim (H)ome - Claim is on the Home plan (Yours) Hos(T) - Claim is on a Host Plan (i.e. you are out of state and visit a doctor with a BCBS contract)
    [forcedbeneprefid] ident NOT NULL, -- Primary key from the for the benepreference table. Populated with the preferred benefit id. | FK marker: X
    [adjudbeneprefid] ident NOT NULL, -- Primary key from the for the benepreference table. Populated with the preferred benefit id during adjudication | FK marker: X
    [determiningclaimid] ident NOT NULL, -- Primary key of the claim table. This is populated with a claimid that is used in calculating this claim | FK marker: X
    [eobreceived] yesnotype NOT NULL, -- Indicates if an EOB was received for a claim
    [isbasesupplemental] yesnotype NOT NULL, -- Column indicates whether claim was adjudicated using base\supplemental processing
    [privacypayeeid] ident NOT NULL, -- Payeeid to pay for member reimbursement REFERENCES member(memid) | FK marker: X
    [suppresseob] yesnotype NOT NULL, -- Indicates if the Explanation of Benefits (EOB) is not issued
    [cobsavingsapplied] zmoney NOT NULL, -- COB credit reserve savings are applied at this claim
    [calccobbyline] char(1) NOT NULL, -- Indicates how COB calculated: (C)laim, (L)ine by line, (' ') Not set
    [haslien] yesnotype NOT NULL, -- Indicates if the claim has a lien (Y/N)
    [hasrefundrequest] yesnotype NOT NULL, -- Refund has been requested from provider/member
    [mspclaim] yesnotype NOT NULL, -- 2.6 (020): Indicates if this record is for a Medicare Secondary Payee (MSP) claim
    [msppayeeid] ident NOT NULL, -- 2.6 (020): Medicare payee identifier from carrier table that will be reimbursed up to the total amount they paid as primary. | FK marker: X
    [reimbursemedicareamt] zmoney NOT NULL, -- 2.6 (020): The dollar amount to reimburse to medicare for a claim that they paid as primary in error.
    [reject] yesnotype NOT NULL, -- 2.6 (037): If edit is deny and reject is 'Y' then indicates it is a rejected claim
    [reimbursecopayamt] zmoney NOT NULL, -- 2.6 (039): The copay dollars the member needs to be reimbursed for because the member met their max out of pocker or maximum coinsured charge and no longer pays a copy.
    [mempaidamt] zmoney NOT NULL, -- 2.6 (039): The amount the member has paid the provider for this claim. The UB92 claim field is: "Prior Paid" (BOX 54). The 1500 field is" "Amt Paid" (Box 29).
    [exportdate837] smalldatetime NULL, -- 2.6 (057): Date external priced claim was exported via 837 from pricing
    [externalpricing] yesnotype NULL, -- 2.6 (057): Indicator that determinesif claim was externally priced
    [importdate837] smalldatetime NULL, -- 2.6 (057): Date external priced claim was imported via 837
    [externaldcn] varchar(50) NULL, -- 2.6 (057): External document control number
    [networkaffilid] ident NULL, -- 2.6 (057): External/Internal network affiliation to use for pricing.
    [doshragrporgpolid] ident NULL, -- Identifier for doshragrporgpol | FK marker: X
    [currhragrporgpolid] ident NULL, -- Identifier for currhragrporgpol | FK marker: X
    [primaryclaimid] ident NULL, -- Identifier for primaryclaim | FK marker: X
    [outlierid] ident NULL, -- Identifier for outlier | FK marker: X
    [nonmember] char(2) NULL, -- Value representing nonmember
    [mhbstatus] char(1) NULL, -- Status of this claim in MyHealthView system
    [isrepricingclaim] yesnotype NULL, -- Indicates if this claim is a repricing claim. If so there are different rules for adjudication. (i.e. no enrollment, no member, etc)
    [rebilltotalamt] zmoney NULL, -- Total rebill carrier amount for claim, calculated by adding up the rebill carrier amounts for each claim line that qualifies as a rebill claim line. If this is set to Null then this is not a rebill carrier claim.
    [rebillreleasedate] udtshortdate NULL, -- Date that the rebill carrier claim will be released for payment. - If the claim is not a rebill Carrier claim, no hold on provider payment, this is set to Null and the status of the claim is set to Pay. If rebillholdpayment = N, no hold on provider paymen
    [otherphyid1name] varchar(60) NULL, -- The name stored for the other physician 1 from a claim form. The other physician one column is used to store other types of physicians associated with a claim such as OPERATING.
    [otherphyid2name] varchar(60) NULL, -- The name stored for the other physician 2 from a claim form. The other physician one column is used to store other types of physicians associated with a claim such as OPERATING.
    [voidreasonid] ident NULL, -- Identifier for voidreason | FK marker: X
    [missinginformation] yesnotype NULL, -- Indicates if the claim is missing information that stopped the claim from adjudicating successfully.
    [contractnetworkid] ident NULL, -- Network identified during adjudication, which will enable payment to quickly find the correct contractinfo record with the 'requestrefund' column and process accordingly. The rest of the contractinfo key is already available.
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
    [Dcn] varchar(30) NULL, -- Document control number used to identify the associated paper claim in Filenet
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
