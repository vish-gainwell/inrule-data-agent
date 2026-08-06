/*
Derived DDL generated from local DED/schema workbook.
This is NOT authoritative SQL Server scripted DDL from the live database.
Use it for architecture review, local cataloging, and initial grounding only.

Database: HRX
Table: dbo.NDC_Mstr
Primary Key from metadata: NDCKey
Description: Stores National Drug Code reference, pricing, limits, or classification data.
*/

CREATE TABLE [HRX].[dbo].[NDC_Mstr]
(
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product | PK marker: X
    [LBLRID] varchar(6) NOT NULL, -- Labeler Identifier; uniquely specifies product labeler (a manufacturer, distributor, or repackager)
    [GCN_SeqNo] varchar(6) NOT NULL, -- GCN Sequence Number (Clinical Formulation ID)
    [PS] varchar(12) NULL, -- Package Size (number of billing units per package)
    [DF] varchar(1) NULL, -- Drug Form code (e.g., 1: tablets, 2: liquids, 3: solids)
    [AD] varchar(20) NULL, -- Drug packing and dispending-unit classification used to support inventory, billing, and claims processing
    [LN] varchar(30) NULL, -- Drug Label Name
    [BN] varchar(30) NULL, -- Brand Name of drug product
    [PNDC] varchar(11) NULL, -- Previous National Drug Code; populated for product replacing an obsolete NDC
    [REPNDC] varchar(11) NULL, -- Replacement National Drug Code for obsolete drug product
    [NDCFI] varchar(1) NULL, -- NDC Format Indicator; identifies location of zero within external identifier code for conversion into NCPDP 11-digit code
    [DADDNC] smalldatetime NULL, -- Date Added to Drug NDC catalog
    [DUPDC] smalldatetime NULL, -- Date of Update to NDC record
    [DESI] varchar(1) NULL, -- Drug Efficacy Study Implementation Indicator; specifies FDA evaluation status
    [DESDTEC] smalldatetime NULL, -- Effective Date for DESI classification or determination for drug
    [DESI2] varchar(1) NULL, -- Secondary Drug Efficacy Study Implementation rating indicator
    [DESI2DTEC] smalldatetime NULL, -- Effective Date for secondary DESI classification or determination for drug
    [DEA] varchar(1) NULL, -- Drug Enforcement Administration Code; specifies federal controlled substance scheule and potential for abuse
    [CL] varchar(1) NULL, -- Class; specifies federal prescription status (e.g., F, O, Q)
    [GPI] varchar(1) NULL, -- Generic Product Indicator code; specifies brand/generic status
    [HOSP] varchar(1) NULL, -- Hospital Indicator; identifies products used in hospital pharmacies
    [INNOV] varchar(1) NULL, -- Innovator Indicator; identifies brand/original product versus generic
    [IPI] varchar(1) NULL, -- Institutional Product Indicator; identifies products sold only to selected customers, usually discounted in price
    [MINI] varchar(1) NULL, -- Mini Selection Indicator; identifies products found in community pharmacies
    [MAINT] varchar(1) NULL, -- Maintenance Drug Indicator; identifies drugs for chronic conditions
    [OBC] varchar(2) NULL, -- Orange Book Code
    [OBSDTEC] smalldatetime NULL, -- Effective Date for when drug became obsolete (i.e., discontinued or made unavailable to marketplace)
    [PPI] varchar(1) NULL, -- Patient Package Insert Indicator; identifies PPI inclusion with drug product
    [STPK] varchar(1) NULL, -- Standard Package Indicator; identifies standard or other package size
    [REPACK] varchar(1) NULL, -- Repackaged Indicator; identifies repackager or non-repackager
    [TOP200] varchar(3) NULL, -- Top 200 Drugs; provides rank of most frequently dispensed brand drug products of previous calendar year
    [UD] varchar(1) NULL, -- Unit Dose Indicator; identifies productrs packed in individual unit doses
    [CSP] varchar(7) NULL, -- Case Pack; provides number of salable units reported by manufacturer
    [NDL_GDGE] decimal(6,3) NULL, -- Needle Gauge measurement for injectable drug delivery
    [NDL_LNGTH] decimal(6,3) NULL, -- Needle Length measurement for injectable drug delivery
    [SYR_CPCTY] decimal(6,3) NULL, -- Syringe Capacity; provides milliliter capcity of specified syringe
    [SHLF_PCK] varchar(7) NULL, -- Shelf Pack size; provides number of bundled salable units in shipping container
    [SHIPPER] varchar(7) NULL, -- Shipper Quantity; provides number of salable units in minimum order quantity from distributor
    [HCFA_FDA] varchar(2) NULL, -- CMS (formerly HCFA) FDA Therapeutic Equivalency Code
    [HCFA_UNIT] varchar(3) NULL, -- CMS (formerly HCFA) Unit Type Indicator; specifies product's unit of measure
    [HCFA_PS] decimal(12,3) NULL, -- CMS (formerly HCFA) Units per Package Size
    [HCFA_APPC] smalldatetime NULL, -- CMS (formerly HCFA) approval date; when drug was approved for Medicare/Medicaid reimbursement
    [HCFA_MRKC] smalldatetime NULL, -- CMS (formerly HCFA) Market Entry Date
    [HCFA_TRMC] smalldatetime NULL, -- CMS (formerly HCFA) Termination Date; when drug was withdrawn from market or last lot expiration
    [HCFA_TYP] varchar(1) NULL, -- CMS (formerly HCFA) Drug Type Indicator; specifies prescription or over-the-counter status of a product
    [HCFA_DESC1] smalldatetime NULL, -- CMS (formerly HCFA) DESI effective date
    [HCFA_DESI1] varchar(1) NULL, -- CMS (formerly HCFA) DESI classification indicator
    [UU] varchar(1) NULL, -- Unit of Use Indicator; identifies produces packaged per couse of therapy
    [PD] varchar(10) NULL, -- Package Description; describes container that is in direct contact with product
    [LN25] varchar(25) NULL, -- Truncated or abbreviated drug label name
    [LN25I] varchar(1) NULL, -- Indicator for truncated or abbreviated drug label name
    [GPIDC] smalldatetime NULL, -- Effective Date associated with GPI classification
    [BBDC] smalldatetime NULL, -- Effective Date for brand drug status eligibility
    [HOME] varchar(1) NULL, -- Home Health Indicator; identifies products used by home healthcare providers
    [INPCKI] varchar(1) NULL, -- Inner Package Indicator; identifies NDCs assigned to packages contained in larger unit
    [OUTPCKI] varchar(1) NULL, -- Outer Package Indicator
    [OBC_EXP] varchar(2) NULL, -- Orange Book Code Description
    [PS_EQUIV] decimal(12,3) NULL, -- Package Size Equivalent Value
    [PLBLR] varchar(1) NULL, -- Private labeler Indicator; identifies products labeled for exclusive distribution
    [TOP50GEN] varchar(2) NULL, -- Top 50 Generics; provides rank of most frequently dispensed prescription generic drugs of previous calendar year
    [OBC3] varchar(3) NULL, -- Orange Book Code (3-byte Version)
    [GMI] varchar(1) NULL, -- Generic Manufacturer Indicator
    [GNI] varchar(1) NULL, -- Generic Name Indicator
    [GSI] varchar(1) NULL, -- Generic Source Indicator; specifies product source classification and generic availability status
    [GTI] varchar(1) NULL, -- Therapeutic Equivalence Indicator; specifies Orange Book code status
    [NDCGI1] varchar(1) NULL, -- Source Indicator; specifies multi-source and single source packaged products (e.g., 1: Multiple, 2: Single)
    [HCFA_DC] varchar(1) NULL, -- CMS (formerly HCFA) Drug Classification indicator; specifies single, multi-, or innovator status
    [DPU_REPNDC] varchar(11) NULL, -- Replacement National Drug Code for obsolete drug product
    [Disable_All_Plans] smalldatetime NULL, -- Effective Date when drug was disabled across benefit plans
    [MinAge] varchar(3) NULL, -- Minimum patient age allowed for dispensing or coverage
    [MaxAge] varchar(3) NULL, -- Maximum patient age allowed for dispensing or coverage
    [SetGender] varchar(1) NULL, -- Gender Indicator; specifies whether drug is intended for a specific gender
    [AddNotActive] smalldatetime NULL, -- Effective Date for drug record addition in inactive state
    [MinDayDose] varchar(8) NULL, -- Minimum allowed daily dose for safe dispensing or plan limits
    [MaxDayDose] varchar(8) NULL, -- Maximum allowed daily dose for safe dispensing or plan limits
    [MaxRefills] varchar(4) NULL, -- Maximum permitted number of refills for prescription
    [MaxRxDays] varchar(4) NULL, -- Maximum days supply allowed per perscription
    [MaxRxUnits] varchar(11) NULL, -- Maximum quantity allowed per prescription refill
    [DaysTillRefill] varchar(4) NULL, -- Minimum days allowed between prescription refill
    [H_GEN_Code] smallint NULL, -- Hierarchy Generic Classification code
    [PA] smallint NULL, -- Prior Authorization Indicator
    [F_GEN_Code] smallint NULL, -- Formulary Generic Classification code
    [ChangedDate] datetime NULL, -- Date and time the record was changed
    [ChangedBy] varchar(15) NULL, -- User who changed the record
    [PKGBILLING] char(1) NOT NULL, -- Indicator specifying whether billing is based on package size or unit
    [stateschedule] varchar(1) NULL, -- State-controlled Substance Schedule Classification
    [maxscriptdays] varchar(3) NULL, -- Maximum days allowed per prescription script
    [ReactivationDate] smalldatetime NULL, -- Effective Date when previously inactive or obsolete NDC was reactivated
    [LN60] varchar(60) NULL, -- Drug Label Name (TJC and ISMP compliant)
    CONSTRAINT [PK_NDC_Mstr] PRIMARY KEY ([NDCKey])
);
