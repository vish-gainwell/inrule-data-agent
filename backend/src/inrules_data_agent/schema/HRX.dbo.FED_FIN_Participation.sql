/*
Authoritative schema with curated DED descriptions.
Description: Reference table containing federal financial participation (FFP) indicators by NDC, supporting Medicaid reimbursement and federal funding eligibility determinations.
*/
CREATE TABLE [HRX].[dbo].[FED_FIN_Participation]
(
    [NDCKey] varchar(11) NOT NULL, -- National Drug Code identifier for drug product
    [FFP_Typ] varchar(2) NOT NULL, -- Federal Financing Participation Indicator Type Code
    [FFP_DateC] smalldatetime NOT NULL, -- Date and time the record was created
    [FFP_IND] varchar(1) NULL -- Federal Financing Participation Indicator
);
