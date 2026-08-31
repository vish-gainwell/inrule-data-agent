/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS. */
CREATE TABLE [plandata_rx_production].[dbo].[ClaimPartial]
(
    [claimid] char(15) NOT NULL,
    [MatchingClaimid] char(15) NOT NULL,
    [DispensingStatus] char(1) NOT NULL,
    [IntendedQuantityToBeDispensed] money NOT NULL,
    [IntendedDaysSupply] int NOT NULL,
    [AssociatedPrescriptionRefNumber] char(15) NOT NULL,
    [AssociatedDateofService] smalldatetime NOT NULL
);
