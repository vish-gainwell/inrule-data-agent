/*
Live SQL Server schema from INFORMATION_SCHEMA and key metadata.
Observed production QueryText pattern: filter COMPOUND.tcn using a runtime TCN collection.
Reviewed relationship: COMPOUND.ndc = HRX.dbo.NDC_Mstr.NDCKey.
Do not infer that COMPOUND.tcn equals a claim column without separate evidence.
*/
CREATE TABLE [HRX].[dbo].[COMPOUND]
(
    [tcn] nvarchar(17) NOT NULL, -- Transaction Control Number
    [ndc] nvarchar(50) NULL, -- NDC identifier for the drug product
    [cost_det_basis] nvarchar(50) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [drug_qty] nvarchar(50) NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ing_cost] money NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [ing_idx] tinyint NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [weight_cost] money NULL, -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
    [CompoundType] char(2) NULL -- Pharmacy attribute used in claims, PA, pricing, or drug reference processing
);
