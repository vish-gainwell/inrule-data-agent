/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS. */
CREATE TABLE [plandata_rx_production].[dbo].[claimpharm]
(
    [claimid] char(15) NOT NULL, -- Primary key of the claim table
    [claimline] int NOT NULL, -- Claim Detail line number
    [rxnumber] char(50) NOT NULL, -- Prescription number
    [rxdate] char(10) NOT NULL, -- Prescription date
    [metricqty] money NOT NULL, -- Amount dispensed in metric units
    [ndcmfgcode] char(5) NOT NULL, -- National Drug Code Manufacturers Code
    [ndcproductcode] char(4) NOT NULL, -- National Drug Code Manufacturers Product Code
    [ndcpackagesize] char(2) NOT NULL, -- National Drug Code Manufacturers package size
    [drugname] char(30) NOT NULL, -- Name of the drug
    [druggenclass] char(15) NOT NULL, -- Drug generic class
    [drugform] char(15) NOT NULL, -- Drug form
    [therapeutclass] char(15) NOT NULL, -- Drug therapeutic class
    [schedulecode] char(15) NOT NULL, -- Schedule code
    [otcind] char(1) NOT NULL, -- Over the counter indicator
    [drugmaint] char(1) NOT NULL, -- Drug maintenance indicator
    [compoundind] int NOT NULL, -- Compound indicator
    [rxprovidtype] int NOT NULL, -- Prescribing provider type
    [rxprovid] char(15) NOT NULL, -- Prescribing provider id
    [ingrcost] money NOT NULL, -- Ingredient cost
    [dispfee] money NOT NULL, -- Dispensing fee
    [taxamt] money NOT NULL, -- Taxable dollar amount
    [dayssupply] int NOT NULL, -- Number of days supply provided
    [macreduct] char(1) NOT NULL, -- Maximum allowable charge reduction
    [refillind] int NOT NULL, -- Refill indicator
    [drugtypecode] int NOT NULL, -- Drug type code
    [refillauth] int NOT NULL, -- Refill authorized
    [diagcode] varchar(8) NOT NULL, -- Diagnosis code
    [prodselectcode] int NOT NULL, -- This is the product selection code.
    [basisofcost] int NOT NULL, -- How the cost for the drugs are arrived at. Values 1 - 9
    [priorauth] char(12) NOT NULL, -- If there was a prior auth the referral number associated with this.
    [certificationnmbr] char(15) NOT NULL, -- NOT USED
    [levelofservice] int NOT NULL, -- The level of service required for the drug
    [prescorigincode] int NOT NULL, -- Where the prescription originated at
    [claimstatus] char(1) NOT NULL, -- The status of the claim for this drug.
    [customarycharge] money NOT NULL, -- The standard charge for the drug
    [rxdatewritten] char(10) NOT NULL, -- Date prescription written
    [dispensecode] char(1) NOT NULL, -- Not Used
    [drugutilreview] char(2) NOT NULL, -- Not Used
    [formularyid] char(1) NOT NULL, -- Not Used
    [unitAWP] int NOT NULL, -- Not Used
    [unitMAC] int NOT NULL, -- Not Used
    [drugcatcode] char(1) NOT NULL, -- Not Used
    [drugdeacode] char(1) NOT NULL, -- Not Used
    [desidrugid] char(1) NOT NULL, -- Not Used
    [unitdoseid] int NOT NULL, -- Not Used
    [pharmacyid] char(12) NOT NULL, -- Pharmacy identifier
    [pharmacyname] char(30) NOT NULL, -- Pharmacy name
    [pharmacycity] char(20) NOT NULL, -- Pharmacy city
    [pharmacystate] char(2) NOT NULL, -- Pharmacy state
    [genericid] char(1) NOT NULL, -- Generic id
    [genericpriceid] int NOT NULL, -- Generic price id
    [drugformcd] char(1) NOT NULL, -- Drug form - Part of universal c form
    [drugnamegeneric] char(30) NOT NULL, -- Generic drug name
    [drugnamebrand] char(30) NOT NULL, -- Brand name of drug
    [drugclass] char(1) NOT NULL, -- Drug class
    [pharmacytaxid] char(9) NOT NULL, -- Pharmacy tax id
    [copay] money NOT NULL, -- copay amount
    [q_rxprovid] char(15) NOT NULL, -- The provider that wrote the prescription
    [createid] varchar(120) NOT NULL, -- Id of the user who created this record
    [createdate] datetime NOT NULL, -- Date this record was created
    [updateid] varchar(120) NOT NULL, -- Id of the user who last updated this record
    [lastupdate] datetime NOT NULL, -- Date this record was last updated
    [drugstrength] char(25) NOT NULL, -- The strength of the prescription
    [ndckey] char(11) NOT NULL, -- Primary key field for this table. National Drug Code (NDC) 5-4-2 Format
    [isprimary] char(1) NOT NULL, -- Indicates if this is the primary NDC code that is to be shown when viewing the claim line.
    [IcdVersion] char(1) NULL, -- Diagnosis ICD Version, '9' for ICD-9 and '0' for ICD-10
    [GrossAmtDue] money NOT NULL,
    [PharmacistId] char(15) NOT NULL,
    [PharmacistIdQual] char(2) NOT NULL,
    [RxLastName] char(60) NOT NULL,
    [UnitOfMeasure] char(2) NOT NULL
);
