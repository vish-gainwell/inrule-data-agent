// src/config/schemaConfig.js

export const DEFAULT_SCHEMA_TENANT = "MDWise";

// Static MVP schema generated from cc-bridge/derived_schema_ddls.
// This is display metadata for the sidebar; backend validation remains authoritative.
export const SCHEMA_CONFIG = {
  "MDWise": {
    "label": "SQL Data Agent Schema",
    "databases": [
      {
        "name": "HRX",
        "schemas": [
          {
            "name": "dbo",
            "tables": [
              {
                "name": "DiagnosisList",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.DiagnosisList.sql",
                "columns": [
                  {
                    "name": "diagnosis_ID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "diagnosis_type",
                    "type": "char",
                    "length": "25",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "diagnosis_code",
                    "type": "char",
                    "length": "8",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "TermDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "description",
                    "type": "varchar",
                    "length": "255",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "IcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "createid",
                    "type": "varchar",
                    "length": "120",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who created the record"
                  },
                  {
                    "name": "createdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was created"
                  },
                  {
                    "name": "updateid",
                    "type": "varchar",
                    "length": "120",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "lastupdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time event or change occurred"
                  }
                ]
              },
              {
                "name": "DrugOverrides",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.DrugOverrides.sql",
                "columns": [
                  {
                    "name": "OverrideID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "NDCKey",
                    "type": "char",
                    "length": "11",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "GCN_SeqNo",
                    "type": "char",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "Type",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "TermDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "Notes",
                    "type": "varchar",
                    "length": "512",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HIC3",
                    "type": "char",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Value",
                    "type": "decimal",
                    "length": "(12,5)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "eg_parameter_enrollstatus_hierarchy",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.eg_parameter_enrollstatus_hierarchy.sql",
                "columns": [
                  {
                    "name": "clientstate",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "planid",
                    "type": "nchar",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "rateid",
                    "type": "nchar",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "sequence",
                    "type": "smallint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "effdate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "termdate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "recordid",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "status_group",
                    "type": "nchar",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "GCNSeqNo_Mstr",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.GCNSeqNo_Mstr.sql",
                "columns": [
                  {
                    "name": "GCN_SeqNo",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "HIC3",
                    "type": "varchar",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HICL_SeqNo",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GCDF",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GCRT",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "STR",
                    "type": "varchar",
                    "length": "10",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GTC",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "TC",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DCC",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GCNSeq_GI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "Gender",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HIC3_Seqn",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "STR60",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "HICLSeqNo_Mstr",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.HICLSeqNo_Mstr.sql",
                "columns": [
                  {
                    "name": "HICL_SeqNo",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GNN",
                    "type": "varchar",
                    "length": "30",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GNN60",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "MemberExclusion",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.MemberExclusion.sql",
                "columns": [
                  {
                    "name": "Memid",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Type",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Value",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "TermDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "CreateDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was created"
                  },
                  {
                    "name": "CreateBy",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who created the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "Notes",
                    "type": "varchar",
                    "length": "2000",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "MEQ",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.MEQ.sql",
                "columns": [
                  {
                    "name": "GCN_SEQNO",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "HIC_SEQN",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "STRENGTH",
                    "type": "varchar",
                    "length": "20",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "CONVFactor",
                    "type": "decimal",
                    "length": "(10,3)",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MEQ",
                    "type": "decimal",
                    "length": "(10,2)",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HIC_DESC",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GCRT_DESC",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "STRENGTH_STATUS_ CODE",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Unit_Of_Measure",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DOSE_DESC",
                    "type": "varchar",
                    "length": "40",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DrugForm",
                    "type": "varchar",
                    "length": "20",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "CreatedBy",
                    "type": "varchar",
                    "length": "20",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who created the record"
                  },
                  {
                    "name": "CreateDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was created"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "varchar",
                    "length": "20",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  }
                ]
              },
              {
                "name": "NDC_Mstr",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.NDC_Mstr.sql",
                "columns": [
                  {
                    "name": "NDCKey",
                    "type": "varchar",
                    "length": "11",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "LBLRID",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GCN_SeqNo",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "PS",
                    "type": "varchar",
                    "length": "12",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DF",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "AD",
                    "type": "varchar",
                    "length": "20",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "LN",
                    "type": "varchar",
                    "length": "30",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "BN",
                    "type": "varchar",
                    "length": "30",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PNDC",
                    "type": "varchar",
                    "length": "11",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "REPNDC",
                    "type": "varchar",
                    "length": "11",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "NDCFI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "DADDNC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DUPDC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DESI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DESDTEC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DESI2",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DESI2DTEC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DEA",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "CL",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GPI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HOSP",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "INNOV",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "IPI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MINI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MAINT",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "OBC",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "OBSDTEC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PPI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "STPK",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "REPACK",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "TOP200",
                    "type": "varchar",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "UD",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "CSP",
                    "type": "varchar",
                    "length": "7",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "NDL_GDGE",
                    "type": "decimal",
                    "length": "(6,3)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "NDL_LNGTH",
                    "type": "decimal",
                    "length": "(6,3)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "SYR_CPCTY",
                    "type": "decimal",
                    "length": "(6,3)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "SHLF_PCK",
                    "type": "varchar",
                    "length": "7",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "SHIPPER",
                    "type": "varchar",
                    "length": "7",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_FDA",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_UNIT",
                    "type": "varchar",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_PS",
                    "type": "decimal",
                    "length": "(12,3)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_APPC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_MRKC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_TRMC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_TYP",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_DESC1",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HCFA_DESI1",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "UU",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PD",
                    "type": "varchar",
                    "length": "10",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "LN25",
                    "type": "varchar",
                    "length": "25",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "LN25I",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GPIDC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "BBDC",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "HOME",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "INPCKI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "OUTPCKI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "OBC_EXP",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PS_EQUIV",
                    "type": "decimal",
                    "length": "(12,3)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PLBLR",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "TOP50GEN",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "OBC3",
                    "type": "varchar",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GMI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GNI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GSI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "GTI",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "NDCGI1",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "HCFA_DC",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DPU_REPNDC",
                    "type": "varchar",
                    "length": "11",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "Disable_All_Plans",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MinAge",
                    "type": "varchar",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Age-based rule or restriction"
                  },
                  {
                    "name": "MaxAge",
                    "type": "varchar",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Age-based rule or restriction"
                  },
                  {
                    "name": "SetGender",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "AddNotActive",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MinDayDose",
                    "type": "varchar",
                    "length": "8",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MaxDayDose",
                    "type": "varchar",
                    "length": "8",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MaxRefills",
                    "type": "varchar",
                    "length": "4",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MaxRxDays",
                    "type": "varchar",
                    "length": "4",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MaxRxUnits",
                    "type": "varchar",
                    "length": "11",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DaysTillRefill",
                    "type": "varchar",
                    "length": "4",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "H_GEN_Code",
                    "type": "smallint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PA",
                    "type": "smallint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "F_GEN_Code",
                    "type": "smallint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "PKGBILLING",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "stateschedule",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "maxscriptdays",
                    "type": "varchar",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ReactivationDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date when the event or update occurred"
                  },
                  {
                    "name": "LN60",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "NDCMaintDetailRules",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.NDCMaintDetailRules.sql",
                "columns": [
                  {
                    "name": "Action_Code",
                    "type": "varchar",
                    "length": "10",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ActionRule",
                    "type": "varchar",
                    "length": "200",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "NDCParameters",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.NDCParameters.sql",
                "columns": [
                  {
                    "name": "PARAM_ID",
                    "type": "numeric",
                    "length": "(16,0)",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PARAMETER_NAME",
                    "type": "nvarchar",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PARAMETER_TITLE",
                    "type": "nvarchar",
                    "length": "100",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PARAMETER_VALUE",
                    "type": "nvarchar",
                    "length": "100",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DESCRIPTION",
                    "type": "nvarchar",
                    "length": "1000",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EFFDATE",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "ENDDATE",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "DEC_PARAM_VAL",
                    "type": "decimal",
                    "length": "(18,5)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  }
                ]
              },
              {
                "name": "NDCPrefDrug",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.NDCPrefDrug.sql",
                "columns": [
                  {
                    "name": "GCN_SeqNo",
                    "type": "varchar",
                    "length": "6",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "NDCKey",
                    "type": "varchar",
                    "length": "11",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "EndDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date when the event or update occurred."
                  },
                  {
                    "name": "PREF",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "PA",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "PDL_Status",
                    "type": "char",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "NDCPriceHistory",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.NDCPriceHistory.sql",
                "columns": [
                  {
                    "name": "NDCKey",
                    "type": "varchar",
                    "length": "11",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "PriceGroupID",
                    "type": "varchar",
                    "length": "4",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pricing or reimbursement value"
                  },
                  {
                    "name": "NPT_Type",
                    "type": "varchar",
                    "length": "2",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "Price",
                    "type": "decimal",
                    "length": "(12,5)",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pricing or reimbursement value"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "varchar",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "Source",
                    "type": "varchar",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "prescriberAllowed",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.prescriberAllowed.sql",
                "columns": [
                  {
                    "name": "ID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "NPI",
                    "type": "char",
                    "length": "10",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DEA",
                    "type": "char",
                    "length": "9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DrugTypeAllowed",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "EndDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date when the event or update occurred."
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "CreateDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was created"
                  }
                ]
              },
              {
                "name": "prescribrExclusion",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.prescribrExclusion.sql",
                "columns": [
                  {
                    "name": "NPI",
                    "type": "char",
                    "length": "10",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DEA",
                    "type": "char",
                    "length": "9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "LastName",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "FirstName",
                    "type": "varchar",
                    "length": "35",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "BusinessName",
                    "type": "varchar",
                    "length": "95",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "EndDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "CreateDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was created"
                  },
                  {
                    "name": "UpdateDate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was updated"
                  },
                  {
                    "name": "Notes",
                    "type": "varchar",
                    "length": "2000",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "ratecode_hierarchy_rx",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.ratecode_hierarchy_rx.sql",
                "columns": [
                  {
                    "name": "RX_rateid",
                    "type": "char",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ratecode",
                    "type": "char",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "sequence",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "MED_rateid",
                    "type": "char",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "StateDiagCodes_Diags",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.StateDiagCodes_Diags.sql",
                "columns": [
                  {
                    "name": "ID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DiagID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DrugGroup",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ICDCodeID",
                    "type": "char",
                    "length": "8",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "IcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  }
                ]
              },
              {
                "name": "StateDiagCodes_DrugGroup",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.StateDiagCodes_DrugGroup.sql",
                "columns": [
                  {
                    "name": "DiagID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DrugGroup",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "LTC_Ind",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Class_Ind",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "BrandGeneric_Ind",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Disposition",
                    "type": "char",
                    "length": "4",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "TermDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "Notes",
                    "type": "varchar",
                    "length": "512",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "StateDiagCodes_Drugs",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.StateDiagCodes_Drugs.sql",
                "columns": [
                  {
                    "name": "ID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DiagID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DrugGroup",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "NDCKey",
                    "type": "char",
                    "length": "11",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "GCN_SeqNo",
                    "type": "char",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "HIC3",
                    "type": "char",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  }
                ]
              },
              {
                "name": "StateDiagCodes_old",
                "coverage": "covered",
                "reason": "Schema pulled from live SQL Server",
                "ddlFile": "by_database\\HRX\\HRX.dbo.StateDiagCodes_old.sql",
                "columns": [
                                {
                                                "name": "DiagID",
                                                "type": "int",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "ICDCodeid",
                                                "type": "char",
                                                "length": "8",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "IcdVersion",
                                                "type": "char",
                                                "length": "1",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "NDCKey",
                                                "type": "char",
                                                "length": "11",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "GCN_SeqNo",
                                                "type": "char",
                                                "length": "6",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "HIC3",
                                                "type": "char",
                                                "length": "3",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "Program_ID",
                                                "type": "varchar",
                                                "length": "20",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "CoverageCode_ID",
                                                "type": "varchar",
                                                "length": "25",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "LTC_Ind",
                                                "type": "char",
                                                "length": "1",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "Class_Ind",
                                                "type": "char",
                                                "length": "1",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "BrandGeneric_Ind",
                                                "type": "char",
                                                "length": "1",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "Disposition",
                                                "type": "char",
                                                "length": "4",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "EffDate",
                                                "type": "smalldatetime",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "TermDate",
                                                "type": "smalldatetime",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "ChangedBy",
                                                "type": "char",
                                                "length": "15",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "ChangedDate",
                                                "type": "smalldatetime",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "Notes",
                                                "type": "varchar",
                                                "length": "512",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                }
                ]
},
              {
                "name": "StateDiagCodes_Programs",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.StateDiagCodes_Programs.sql",
                "columns": [
                  {
                    "name": "ID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DiagID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "DrugGroup",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Program_ID",
                    "type": "varchar",
                    "length": "20",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "CoverageCode_ID",
                    "type": "varchar",
                    "length": "25",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Age-based rule or restriction"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  }
                ]
              },
              {
                "name": "StateMessages",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\HRX\\HRX.dbo.StateMessages.sql",
                "columns": [
                  {
                    "name": "MessageID",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Age-based rule or restriction"
                  },
                  {
                    "name": "NDCKey",
                    "type": "char",
                    "length": "11",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NDC identifier for the drug product"
                  },
                  {
                    "name": "GCN_SeqNo",
                    "type": "char",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Generic code number sequence for drug grouping"
                  },
                  {
                    "name": "HIC3",
                    "type": "char",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Program_ID",
                    "type": "varchar",
                    "length": "20",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "CoverageCode_ID",
                    "type": "varchar",
                    "length": "25",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Age-based rule or restriction"
                  },
                  {
                    "name": "LTC_Ind",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Class_Ind",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "BrandGeneric_Ind",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "Message",
                    "type": "varchar",
                    "length": "200",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Age-based rule or restriction"
                  },
                  {
                    "name": "Disposition",
                    "type": "char",
                    "length": "4",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes effective"
                  },
                  {
                    "name": "TermDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record becomes inactive"
                  },
                  {
                    "name": "ChangedBy",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who changed the record"
                  },
                  {
                    "name": "ChangedDate",
                    "type": "smalldate time",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was changed"
                  },
                  {
                    "name": "Notes",
                    "type": "varchar",
                    "length": "512",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Pharmacy attribute used in claims, PA, pricing, or drug reference processing"
                  }
                ]
              },
              {
                "name": "step_therapy_drug",
                "coverage": "covered",
                "reason": "Schema pulled from live SQL Server",
                "ddlFile": "by_database\\HRX\\HRX.dbo.step_therapy_drug.sql",
                "columns": [
                  {
                    "name": "stg_id",
                    "type": "tinyint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "stl_id",
                    "type": "tinyint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "gcn_seqno",
                    "type": "decimal",
                    "length": "6,0",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "hicl_seqno",
                    "type": "decimal",
                    "length": "6,0",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "stl_eff_date",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "stl_end_date",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "change_user_name",
                    "type": "varchar",
                    "length": "32",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "change_date",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  }
                ]
              },
              {
                "name": "step_therapy_level",
                "coverage": "covered",
                "reason": "Schema pulled from live SQL Server",
                "ddlFile": "by_database\\HRX\\HRX.dbo.step_therapy_level.sql",
                "columns": [
                  {
                    "name": "stg_id",
                    "type": "tinyint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "stl_id",
                    "type": "tinyint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "min_step_days_cnt",
                    "type": "smallint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "min_step_drug_cnt",
                    "type": "tinyint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "max_gap_days_cnt",
                    "type": "smallint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "change_user_name",
                    "type": "varchar",
                    "length": "32",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "change_date",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "name": "plandata_rx_production",
        "schemas": [
          {
            "name": "dbo",
            "tables": [
              {
                "name": "claim",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\plandata_rx_production\\plandata_rx_production.dbo.claim.sql",
                "columns": [
                  {
                    "name": "claimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier for claim"
                  },
                  {
                    "name": "referralid",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for referral"
                  },
                  {
                    "name": "enrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for enroll"
                  },
                  {
                    "name": "affiliationid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for affiliation"
                  },
                  {
                    "name": "facilitycode",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing facilitycode"
                  },
                  {
                    "name": "memid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for mem"
                  },
                  {
                    "name": "billclasscode",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing billclasscode"
                  },
                  {
                    "name": "frequencycode",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing frequencycode"
                  },
                  {
                    "name": "startdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to startdate"
                  },
                  {
                    "name": "enddate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to enddate"
                  },
                  {
                    "name": "controlnmb",
                    "type": "char",
                    "length": "20",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing controlnmb"
                  },
                  {
                    "name": "admitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to admitdate"
                  },
                  {
                    "name": "admithour",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing admithour"
                  },
                  {
                    "name": "medrecnmb",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing medrecnmb"
                  },
                  {
                    "name": "payer",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing payer"
                  },
                  {
                    "name": "relinfo",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing relinfo"
                  },
                  {
                    "name": "admittype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing admittype"
                  },
                  {
                    "name": "asgben",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing asgben"
                  },
                  {
                    "name": "admitsource",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing admitsource"
                  },
                  {
                    "name": "priorpay",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing priorpay"
                  },
                  {
                    "name": "patientstatus",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating patientstatus"
                  },
                  {
                    "name": "estamtdue",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing estamtdue"
                  },
                  {
                    "name": "esc",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing esc"
                  },
                  {
                    "name": "reason",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing reason"
                  },
                  {
                    "name": "plancrn",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing plancrn"
                  },
                  {
                    "name": "plansubdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to plansubdate"
                  },
                  {
                    "name": "eligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing eligibleamt"
                  },
                  {
                    "name": "totaldeduct",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totaldeduct"
                  },
                  {
                    "name": "remitno",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing remitno"
                  },
                  {
                    "name": "adjuddate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to adjuddate"
                  },
                  {
                    "name": "logdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to logdate"
                  },
                  {
                    "name": "cleandate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to cleandate"
                  },
                  {
                    "name": "orgclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for orgclaim"
                  },
                  {
                    "name": "attendphyid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for attendphy"
                  },
                  {
                    "name": "resubclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for resubclaim"
                  },
                  {
                    "name": "formtype",
                    "type": "typecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing formtype"
                  },
                  {
                    "name": "plansubmit",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing plansubmit"
                  },
                  {
                    "name": "otherphyid1",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing otherphyid1"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time of the last update"
                  },
                  {
                    "name": "otherphyid2",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing otherphyid2"
                  },
                  {
                    "name": "provrep",
                    "type": "nametype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing provrep"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who updated the record"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who created the record"
                  },
                  {
                    "name": "provrepdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to provrepdate"
                  },
                  {
                    "name": "totalamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totalamt"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was created"
                  },
                  {
                    "name": "attendphyname",
                    "type": "shortdesctype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing attendphyname"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating status"
                  },
                  {
                    "name": "planid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for plan"
                  },
                  {
                    "name": "eobamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing eobamt"
                  },
                  {
                    "name": "eobeligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing eobeligibleamt"
                  },
                  {
                    "name": "totalpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for totalpa"
                  },
                  {
                    "name": "emergency",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing emergency"
                  },
                  {
                    "name": "contractid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for contract"
                  },
                  {
                    "name": "paiddate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to paiddate"
                  },
                  {
                    "name": "drg",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing drg"
                  },
                  {
                    "name": "userinitials",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing userinitials"
                  },
                  {
                    "name": "okpaydate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to okpaydate"
                  },
                  {
                    "name": "provid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for prov"
                  },
                  {
                    "name": "okpayby",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing okpayby"
                  },
                  {
                    "name": "claimbypcp",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing claimbypcp"
                  },
                  {
                    "name": "shareofcost",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing shareofcost"
                  },
                  {
                    "name": "dischargehour",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing dischargehour"
                  },
                  {
                    "name": "haspool",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing haspool"
                  },
                  {
                    "name": "ffspoolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for ffspool"
                  },
                  {
                    "name": "ffspoolamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing ffspoolamt"
                  },
                  {
                    "name": "outofarea",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing outofarea"
                  },
                  {
                    "name": "covereddays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing covereddays"
                  },
                  {
                    "name": "noncovereddays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing noncovereddays"
                  },
                  {
                    "name": "coinsurancedays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing coinsurancedays"
                  },
                  {
                    "name": "lifereservedays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing lifereservedays"
                  },
                  {
                    "name": "isencounter",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isencounter"
                  },
                  {
                    "name": "serviceaffilid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for serviceaffil"
                  },
                  {
                    "name": "dischargedate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to dischargedate"
                  },
                  {
                    "name": "isemployment",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isemployment"
                  },
                  {
                    "name": "isautoaccident",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isautoaccident"
                  },
                  {
                    "name": "isotheraccident",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isotheraccident"
                  },
                  {
                    "name": "dateonset",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to dateonset"
                  },
                  {
                    "name": "similarillnessdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to similarillnessdate"
                  },
                  {
                    "name": "accidentstate",
                    "type": "statetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing accidentstate"
                  },
                  {
                    "name": "manualencounter",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing manualencounter"
                  },
                  {
                    "name": "isepsdt",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isepsdt"
                  },
                  {
                    "name": "initialprothesis",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing initialprothesis"
                  },
                  {
                    "name": "priorprothesisdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to priorprothesisdate"
                  },
                  {
                    "name": "isorthodontics",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isorthodontics"
                  },
                  {
                    "name": "orthoappldate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to orthoappldate"
                  },
                  {
                    "name": "orthomosrem",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing orthomosrem"
                  },
                  {
                    "name": "totalreimburseamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totalreimburseamt"
                  },
                  {
                    "name": "hasdocuments",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing hasdocuments"
                  },
                  {
                    "name": "referfrom",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing referfrom"
                  },
                  {
                    "name": "isstoploss",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isstoploss"
                  },
                  {
                    "name": "totalrefundamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totalrefundamt"
                  },
                  {
                    "name": "planresub",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing planresub"
                  },
                  {
                    "name": "planresubdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to planresubdate"
                  },
                  {
                    "name": "hascareplan",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing hascareplan"
                  },
                  {
                    "name": "reimbursemember",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing reimbursemember"
                  },
                  {
                    "name": "totalsubmitdiscount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totalsubmitdiscount"
                  },
                  {
                    "name": "totaladdlmemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totaladdlmemamt"
                  },
                  {
                    "name": "totalmemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totalmemamt"
                  },
                  {
                    "name": "importfinal",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing importfinal"
                  },
                  {
                    "name": "payeeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for payee"
                  },
                  {
                    "name": "claimsourceid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for claimsource"
                  },
                  {
                    "name": "carryoverintdays",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing carryoverintdays"
                  },
                  {
                    "name": "externalenrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for externalenroll"
                  },
                  {
                    "name": "paycobbyline",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing paycobbyline"
                  },
                  {
                    "name": "totextdeductamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totextdeductamt"
                  },
                  {
                    "name": "totextcopayamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totextcopayamt"
                  },
                  {
                    "name": "totextcoinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totextcoinsuranceamt"
                  },
                  {
                    "name": "totextpaidamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totextpaidamt"
                  },
                  {
                    "name": "interestdays",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing interestdays"
                  },
                  {
                    "name": "cobsavings",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing cobsavings"
                  },
                  {
                    "name": "isitsclaim",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isitsclaim"
                  },
                  {
                    "name": "forcedbeneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for forcedbenepref"
                  },
                  {
                    "name": "adjudbeneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for adjudbenepref"
                  },
                  {
                    "name": "determiningclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for determiningclaim"
                  },
                  {
                    "name": "eobreceived",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing eobreceived"
                  },
                  {
                    "name": "isbasesupplemental",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isbasesupplemental"
                  },
                  {
                    "name": "privacypayeeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for privacypayee"
                  },
                  {
                    "name": "suppresseob",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing suppresseob"
                  },
                  {
                    "name": "cobsavingsapplied",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing cobsavingsapplied"
                  },
                  {
                    "name": "calccobbyline",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing calccobbyline"
                  },
                  {
                    "name": "haslien",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing haslien"
                  },
                  {
                    "name": "hasrefundrequest",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing hasrefundrequest"
                  },
                  {
                    "name": "mspclaim",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing mspclaim"
                  },
                  {
                    "name": "msppayeeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for msppayee"
                  },
                  {
                    "name": "reimbursemedicareamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing reimbursemedicareamt"
                  },
                  {
                    "name": "reject",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing reject"
                  },
                  {
                    "name": "reimbursecopayamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing reimbursecopayamt"
                  },
                  {
                    "name": "mempaidamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing mempaidamt"
                  },
                  {
                    "name": "exportdate837",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to exportdate837"
                  },
                  {
                    "name": "externalpricing",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing externalpricing"
                  },
                  {
                    "name": "importdate837",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to importdate837"
                  },
                  {
                    "name": "externaldcn",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing externaldcn"
                  },
                  {
                    "name": "networkaffilid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for networkaffil"
                  },
                  {
                    "name": "doshragrporgpolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for doshragrporgpol"
                  },
                  {
                    "name": "currhragrporgpolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for currhragrporgpol"
                  },
                  {
                    "name": "primaryclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for primaryclaim"
                  },
                  {
                    "name": "outlierid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for outlier"
                  },
                  {
                    "name": "nonmember",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing nonmember"
                  },
                  {
                    "name": "mhbstatus",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating mhbstatus"
                  },
                  {
                    "name": "isrepricingclaim",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isrepricingclaim"
                  },
                  {
                    "name": "rebilltotalamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing rebilltotalamt"
                  },
                  {
                    "name": "rebillreleasedate",
                    "type": "udtshortdate",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to rebillreleasedate"
                  },
                  {
                    "name": "otherphyid1name",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing otherphyid1name"
                  },
                  {
                    "name": "otherphyid2name",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing otherphyid2name"
                  },
                  {
                    "name": "voidreasonid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for voidreason"
                  },
                  {
                    "name": "missinginformation",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing missinginformation"
                  },
                  {
                    "name": "contractnetworkid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for contractnetwork"
                  },
                  {
                    "name": "formcreationdate",
                    "type": "udtlongdate",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to formcreationdate"
                  },
                  {
                    "name": "billtypeprefix",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing billtypeprefix"
                  },
                  {
                    "name": "isltc",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isltc"
                  },
                  {
                    "name": "BenefitsAssignment",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing benefitsassignment"
                  },
                  {
                    "name": "ProviderTaxonomyCode",
                    "type": "typecode",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing providertaxonomycode"
                  },
                  {
                    "name": "DeceasedDate",
                    "type": "udtshortdate",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to deceaseddate"
                  },
                  {
                    "name": "NoWorkFromDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to noworkfromdate"
                  },
                  {
                    "name": "NoWorkToDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to noworktodate"
                  },
                  {
                    "name": "SignatureOnFile",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing signatureonfile"
                  },
                  {
                    "name": "SpecialProgramCode",
                    "type": "typecode",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing specialprogramcode"
                  },
                  {
                    "name": "EOBRequested",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing eobrequested"
                  },
                  {
                    "name": "COBPaidDate",
                    "type": "udtlongdate",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to cobpaiddate"
                  },
                  {
                    "name": "copcid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for copc"
                  },
                  {
                    "name": "ProviderParStatus",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating providerparstatus"
                  },
                  {
                    "name": "CobLessorAmtMethod_x000D_\nApplied",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing coblessoramtmethodapplied"
                  },
                  {
                    "name": "MedicareCrossover_x000D_\nIndicator",
                    "type": "varchar",
                    "length": "10",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing medicarecrossoverindicator"
                  },
                  {
                    "name": "Dcn",
                    "type": "varchar",
                    "length": "30",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing dcn"
                  },
                  {
                    "name": "ExternalFinancialStatus",
                    "type": "varchar",
                    "length": "25",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating externalfinancialstatus"
                  },
                  {
                    "name": "MergeFromEnrollId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for mergefromenroll"
                  },
                  {
                    "name": "TotMemSpendDown",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totmemspenddown"
                  },
                  {
                    "name": "IsNxPbaClaim",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isnxpbaclaim"
                  },
                  {
                    "name": "NxPbaPatientEventId",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for nxpbapatientevent"
                  },
                  {
                    "name": "ExternalClaimId",
                    "type": "varchar",
                    "length": "30",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for externalclaim"
                  },
                  {
                    "name": "IsBundled",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isbundled"
                  },
                  {
                    "name": "admitminute",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing admitminute"
                  },
                  {
                    "name": "dischargeminute",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing dischargeminute"
                  }
                ]
              },
              {
                "name": "claimdetail",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\plandata_rx_production\\plandata_rx_production.dbo.claimdetail.sql",
                "columns": [
                  {
                    "name": "claimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "X",
                    "description": "Identifier for claim"
                  },
                  {
                    "name": "claimline",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Value representing claimline"
                  },
                  {
                    "name": "referralid",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for referral"
                  },
                  {
                    "name": "revcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing revcode"
                  },
                  {
                    "name": "contractid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for contract"
                  },
                  {
                    "name": "termid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for term"
                  },
                  {
                    "name": "planid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for plan"
                  },
                  {
                    "name": "benefitid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for benefit"
                  },
                  {
                    "name": "servunits",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing servunits"
                  },
                  {
                    "name": "total",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing total"
                  },
                  {
                    "name": "servcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing servcode"
                  },
                  {
                    "name": "modcode",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode"
                  },
                  {
                    "name": "dosfrom",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing dosfrom"
                  },
                  {
                    "name": "dosto",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing dosto"
                  },
                  {
                    "name": "location",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing location"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating status"
                  },
                  {
                    "name": "claimamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing claimamt"
                  },
                  {
                    "name": "conteligamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing conteligamt"
                  },
                  {
                    "name": "amountpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for amountpa"
                  },
                  {
                    "name": "deductible",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing deductible"
                  },
                  {
                    "name": "plancrn",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing plancrn"
                  },
                  {
                    "name": "contractpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for contractpa"
                  },
                  {
                    "name": "benefitamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing benefitamt"
                  },
                  {
                    "name": "contractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing contractamt"
                  },
                  {
                    "name": "capitated",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing capitated"
                  },
                  {
                    "name": "submitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to submitdate"
                  },
                  {
                    "name": "plansub",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing plansub"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time of the last update"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who updated the record"
                  },
                  {
                    "name": "prindiag",
                    "type": "udtdiagcode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing prindiag"
                  },
                  {
                    "name": "emergency",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing emergency"
                  },
                  {
                    "name": "cob",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing cob"
                  },
                  {
                    "name": "epsdt",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing epsdt"
                  },
                  {
                    "name": "typesrv",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing typesrv"
                  },
                  {
                    "name": "ineligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing ineligibleamt"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date and time the record was created"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who created the record"
                  },
                  {
                    "name": "cobamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing cobamt"
                  },
                  {
                    "name": "userinitials",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing userinitials"
                  },
                  {
                    "name": "copay",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing copay"
                  },
                  {
                    "name": "adjudicate",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing adjudicate"
                  },
                  {
                    "name": "costshareamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing costshareamt"
                  },
                  {
                    "name": "costshareper",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing costshareper"
                  },
                  {
                    "name": "contpercent",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing contpercent"
                  },
                  {
                    "name": "benepercent",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing benepercent"
                  },
                  {
                    "name": "remvisits",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing remvisits"
                  },
                  {
                    "name": "maxvisits",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing maxvisits"
                  },
                  {
                    "name": "network",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing network"
                  },
                  {
                    "name": "benededuct",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing benededuct"
                  },
                  {
                    "name": "annualaccrual",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing annualaccrual"
                  },
                  {
                    "name": "lifetimeaccrual",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing lifetimeaccrual"
                  },
                  {
                    "name": "maxoutaccrual",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing maxoutaccrual"
                  },
                  {
                    "name": "coscode",
                    "type": "catservice",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing coscode"
                  },
                  {
                    "name": "catexp",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing catexp"
                  },
                  {
                    "name": "paydiscount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing paydiscount"
                  },
                  {
                    "name": "subcat",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing subcat"
                  },
                  {
                    "name": "beneinelig",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing beneinelig"
                  },
                  {
                    "name": "riderid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for rider"
                  },
                  {
                    "name": "carelevel",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing carelevel"
                  },
                  {
                    "name": "medcoverage",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing medcoverage"
                  },
                  {
                    "name": "fracunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing fracunits"
                  },
                  {
                    "name": "authunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing authunits"
                  },
                  {
                    "name": "poolamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing poolamt"
                  },
                  {
                    "name": "haspool",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing haspool"
                  },
                  {
                    "name": "poolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for pool"
                  },
                  {
                    "name": "fundid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for fund"
                  },
                  {
                    "name": "ffspoolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for ffspool"
                  },
                  {
                    "name": "ffspoolamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing ffspoolamt"
                  },
                  {
                    "name": "toothnumber",
                    "type": "toothtype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing toothnumber"
                  },
                  {
                    "name": "toothsurface",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing toothsurface"
                  },
                  {
                    "name": "reimburseamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing reimburseamt"
                  },
                  {
                    "name": "billservcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing billservcode"
                  },
                  {
                    "name": "approvedservcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing approvedservcode"
                  },
                  {
                    "name": "refundamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing refundamt"
                  },
                  {
                    "name": "submitdiscount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing submitdiscount"
                  },
                  {
                    "name": "modcode2",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode2"
                  },
                  {
                    "name": "modcode3",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode3"
                  },
                  {
                    "name": "addlmemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing addlmemamt"
                  },
                  {
                    "name": "memamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing memamt"
                  },
                  {
                    "name": "diag1",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag1"
                  },
                  {
                    "name": "diag2",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag2"
                  },
                  {
                    "name": "diag3",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag3"
                  },
                  {
                    "name": "diag4",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag4"
                  },
                  {
                    "name": "globalcovthrudate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to globalcovthrudate"
                  },
                  {
                    "name": "modcode4",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode4"
                  },
                  {
                    "name": "modcode5",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode5"
                  },
                  {
                    "name": "multmodtiercount",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing multmodtiercount"
                  },
                  {
                    "name": "multmodtiercount2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing multmodtiercount2"
                  },
                  {
                    "name": "multmodtiercount3",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing multmodtiercount3"
                  },
                  {
                    "name": "multmodtiercount4",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing multmodtiercount4"
                  },
                  {
                    "name": "multmodtiercount5",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing multmodtiercount5"
                  },
                  {
                    "name": "coinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing coinsuranceamt"
                  },
                  {
                    "name": "copayperdiemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing copayperdiemamt"
                  },
                  {
                    "name": "ispricebyauth",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing ispricebyauth"
                  },
                  {
                    "name": "cobeligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing cobeligibleamt"
                  },
                  {
                    "name": "medicareactioncode",
                    "type": "char",
                    "length": "8",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing medicareactioncode"
                  },
                  {
                    "name": "isclaimauthloc",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing isclaimauthloc"
                  },
                  {
                    "name": "prioramtpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for prioramtpa"
                  },
                  {
                    "name": "authline",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing authline"
                  },
                  {
                    "name": "redcoinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing redcoinsuranceamt"
                  },
                  {
                    "name": "origbeneclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for origbeneclaim"
                  },
                  {
                    "name": "origbeneadmitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to origbeneadmitdate"
                  },
                  {
                    "name": "membmaxfeeamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing membmaxfeeamt"
                  },
                  {
                    "name": "paymentapc",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing paymentapc"
                  },
                  {
                    "name": "hcpcsapc",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing hcpcsapc"
                  },
                  {
                    "name": "extdeductamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing extdeductamt"
                  },
                  {
                    "name": "extcopayamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing extcopayamt"
                  },
                  {
                    "name": "extcoinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing extcoinsuranceamt"
                  },
                  {
                    "name": "extpaidamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing extpaidamt"
                  },
                  {
                    "name": "allocatedvisits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing allocatedvisits"
                  },
                  {
                    "name": "billedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing billedunits"
                  },
                  {
                    "name": "cobsavingsappliedamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing cobsavingsappliedamt"
                  },
                  {
                    "name": "allowedamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing allowedamt"
                  },
                  {
                    "name": "payasstatus",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating payasstatus"
                  },
                  {
                    "name": "beneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for benepref"
                  },
                  {
                    "name": "employerfeeamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing employerfeeamt"
                  },
                  {
                    "name": "detailsourcetype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing detailsourcetype"
                  },
                  {
                    "name": "penaltyamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing penaltyamt"
                  },
                  {
                    "name": "cobsavingsamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing cobsavingsamt"
                  },
                  {
                    "name": "payasprimary",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing payasprimary"
                  },
                  {
                    "name": "autofillauth",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing autofillauth"
                  },
                  {
                    "name": "provresppenaltyamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing provresppenaltyamt"
                  },
                  {
                    "name": "accomodationrate",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing accomodationrate"
                  },
                  {
                    "name": "hhppsoutlieramt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing hhppsoutlieramt"
                  },
                  {
                    "name": "claimsubdetailtype",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing claimsubdetailtype"
                  },
                  {
                    "name": "modcodepreadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcodepreadjud"
                  },
                  {
                    "name": "modcode2preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode2preadjud"
                  },
                  {
                    "name": "modcode3preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode3preadjud"
                  },
                  {
                    "name": "modcode4preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode4preadjud"
                  },
                  {
                    "name": "modcode5preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing modcode5preadjud"
                  },
                  {
                    "name": "Usemanualcontrac_x000D_\ntprice",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing usemanualcontractprice"
                  },
                  {
                    "name": "Manualcontractprice_x000D_\namt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing manualcontractpriceamt"
                  },
                  {
                    "name": "diag5",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag5"
                  },
                  {
                    "name": "diag6",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag6"
                  },
                  {
                    "name": "diag7",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag7"
                  },
                  {
                    "name": "diag8",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diag8"
                  },
                  {
                    "name": "overridecontractpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for overridecontractpa"
                  },
                  {
                    "name": "overridecontractid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for overridecontract"
                  },
                  {
                    "name": "overridetermcontractid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for overridetermcontract"
                  },
                  {
                    "name": "overridecontracttermid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for overridecontractterm"
                  },
                  {
                    "name": "differentialamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing differentialamt"
                  },
                  {
                    "name": "startingcontractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing startingcontractamt"
                  },
                  {
                    "name": "initialclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for initialclaim"
                  },
                  {
                    "name": "initialclaimline",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Value representing initialclaimline"
                  },
                  {
                    "name": "umapprovedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing umapprovedunits"
                  },
                  {
                    "name": "memrespcharges",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing memrespcharges"
                  },
                  {
                    "name": "externalcontractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing externalcontractamt"
                  },
                  {
                    "name": "internalcontractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing internalcontractamt"
                  },
                  {
                    "name": "copaygroupid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for copaygroup"
                  },
                  {
                    "name": "hraeligible",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing hraeligible"
                  },
                  {
                    "name": "dentalareaid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for dentalarea"
                  },
                  {
                    "name": "downcodesurfacecount",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing downcodesurfacecount"
                  },
                  {
                    "name": "writeoffamount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing writeoffamount"
                  },
                  {
                    "name": "itspricingmethod",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Value representing itspricingmethod"
                  },
                  {
                    "name": "itspricingrule",
                    "type": "char",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Value representing itspricingrule"
                  },
                  {
                    "name": "itssecpricingrule",
                    "type": "char",
                    "length": "6",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Value representing itssecpricingrule"
                  },
                  {
                    "name": "renderingprovid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for renderingprov"
                  },
                  {
                    "name": "rebillamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing rebillamt"
                  },
                  {
                    "name": "anesminutes",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing anesminutes"
                  },
                  {
                    "name": "hasndccode",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing hasndccode"
                  },
                  {
                    "name": "dtlmissinginfo",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing dtlmissinginfo"
                  },
                  {
                    "name": "paylimitid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for paylimit"
                  },
                  {
                    "name": "ProviderTaxonomyCode",
                    "type": "typecode",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing providertaxonomycode"
                  },
                  {
                    "name": "LineItemControlNumber",
                    "type": "char",
                    "length": "30",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing lineitemcontrolnumber"
                  },
                  {
                    "name": "ITSMaxReimbFlag",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing itsmaxreimbflag"
                  },
                  {
                    "name": "ITSMaxReimbAmount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing itsmaxreimbamount"
                  },
                  {
                    "name": "ITSContractDefaultFFS_x000D_\nFlag",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing itscontractdefaultffsflag"
                  },
                  {
                    "name": "ITSContractDefaultFFS_x000D_\nPercent",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing itscontractdefaultffspercent"
                  },
                  {
                    "name": "IcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing icdversion"
                  },
                  {
                    "name": "CoverageCodeId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for coveragecode"
                  },
                  {
                    "name": "ExternalFinancialStatus",
                    "type": "varchar",
                    "length": "25",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Status flag indicating externalfinancialstatus"
                  },
                  {
                    "name": "MemSpendDown",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing memspenddown"
                  },
                  {
                    "name": "ItsInclusiveGrouping",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing itsinclusivegrouping"
                  },
                  {
                    "name": "Rebateable",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing rebateable"
                  },
                  {
                    "name": "PreBundledAmount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing prebundledamount"
                  },
                  {
                    "name": "SOCTypeId",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Identifier for soctype"
                  },
                  {
                    "name": "SOCTypeAmount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing soctypeamount"
                  },
                  {
                    "name": "GlobalCovFromDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to globalcovfromdate"
                  },
                  {
                    "name": "OutputCaseLineID",
                    "type": "char",
                    "length": "15",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for outputcaseline"
                  }
                ]
              },
              {
                "name": "ClaimForm",
                "coverage": "covered",
                "reason": "Schema pulled from live SQL Server",
                "ddlFile": "by_database\\plandata_rx_production\\plandata_rx_production.dbo.ClaimForm.sql",
                "columns": [
                                {
                                                "name": "FormType",
                                                "type": "typecode",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "FormTypeDesc",
                                                "type": "udtshortdesc",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "ClaimType",
                                                "type": "typecode",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "InactiveDate",
                                                "type": "udttermdate",
                                                "length": "",
                                                "nullable": "Yes",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "DefaultForm",
                                                "type": "yesnotype",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "DisplaySequence",
                                                "type": "zint",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "IsReferenceData",
                                                "type": "yesnotype",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "CreateId",
                                                "type": "udtuserid",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "CreateDate",
                                                "type": "udtlongdate",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "UpdateId",
                                                "type": "udtuserid",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                },
                                {
                                                "name": "LastUpdate",
                                                "type": "udtlongdate",
                                                "length": "",
                                                "nullable": "No",
                                                "pk": "",
                                                "fk": "",
                                                "description": "Schema pulled from live SQL Server"
                                }
                ]
},
              {
                "name": "authservice",
                "coverage": "covered",
                "reason": "Schema pulled from live SQL Server",
                "ddlFile": "by_database\\plandata_rx_production\\plandata_rx_production.dbo.authservice.sql",
                "columns": [
                  {
                    "name": "referralid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "sequence",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "codeid",
                    "type": "char",
                    "length": "11",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "medcoverage",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "carelevel",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "servcategory",
                    "type": "cattype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "xreasoncode",
                    "type": "typecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "overridecontract",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "totalunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "usedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "actualunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "tier",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "dosdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "globalday",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "reqcodeid",
                    "type": "char",
                    "length": "11",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "catid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "subcatid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "svcgroupid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "reqcatid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "reqsubcatid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "reqsvcgrpid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "modcode",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "modcode2",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "toothnumber",
                    "type": "toothtype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "toothsurface",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "approvedcodeid",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "modcode3",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "modcode4",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "modcode5",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "globaltemplate",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "negotiatedcontract",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "negotiatedterm",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "negotiatedvalue",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "ispatientresp",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "ndcprodname",
                    "type": "char",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "appndcgroupname",
                    "type": "char",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "interqualid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "meddirectorid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "requestedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "svcprocamount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "initialreferralid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "initialreferralseq",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "detailsourcetype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "initialreferraltemplate",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "dentalareaid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "downcodesurfacecount",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "DeterminationDate",
                    "type": "udtshortdate",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "H278RecordSequence",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "location",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "Frequency",
                    "type": "char",
                    "length": "8",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "TermDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "ReqEffDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "ReqTermDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "decrementtype",
                    "type": "char",
                    "length": "3",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "TotalBudget",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "UsedBudget",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "ReqTotalBudget",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  }
                ]
              },
              {
                "name": "enrollcoverage",
                "coverage": "covered",
                "reason": "Schema pulled from live SQL Server",
                "ddlFile": "by_database\\plandata_rx_production\\plandata_rx_production.dbo.enrollcoverage.sql",
                "columns": [
                  {
                    "name": "enrollcoverageid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "enrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "ratecode",
                    "type": "nametype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "coveragecodeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "effdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "termdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  }
                ]
              },
              {
                "name": "referral",
                "coverage": "covered",
                "reason": "Schema pulled from live SQL Server",
                "ddlFile": "by_database\\plandata_rx_production\\plandata_rx_production.dbo.referral.sql",
                "columns": [
                  {
                    "name": "referralid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "enrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "memid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "servicecode",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "COB",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "referto",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "effdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "referfrom",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "emergency",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "authorizationid",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "referraldate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "transferinout",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "admitphys",
                    "type": "longname",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "disdiagnosis",
                    "type": "udtdiagcode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "admitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "numappt",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "dischargedate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "tier1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "tier2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "staytype1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "termdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "staytype2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "issueinitials",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "actual1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "actual2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "actualstay1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "actualstay2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "daysdenied",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "deferreddliab",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "reinsurance",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "costest",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "perdiemest",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "accchg",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "diagnosis",
                    "type": "udtdiagcode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "admit",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "numremappt",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "acuity",
                    "type": "typecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "attprovid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "admtprovid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "self",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "asstsurgeon",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "authstatus",
                    "type": "umstatustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "hasassist",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "receiptdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "seendate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "userid",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "outofarea",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "ispredetermination",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "paytoaffiliationid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "hasdocuments",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "isautodischargedate",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "referfromnetwork",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "pendclaims",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "refertoprovtype",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "refertopar",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "refertolocation",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "isglobal",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "accidentcause",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "accidentdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "investigation",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "lmpdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "estdeldate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "surgerydatetime",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "decrementtype",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "surgerysuggested",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "appeal",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "appealdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "reviewtype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "beneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "appealoutcome",
                    "type": "shortdesctype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "penaltyapplies",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "retroreview",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "reqlos",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "actuallos",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "processlogid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "source",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "h278responseneeded",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "h278responsesent",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "h278processlogdetailid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "h278responsestatus",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "reqpatinfo",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "h278haschanges",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "dispositionid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "priority",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "highlight",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "nextreviewdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "DiagnosisIcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "DisDiagnosisIcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "MergeFromReferralId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "IsConsolidated",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date or audit value from live SQL Server schema"
                  },
                  {
                    "name": "ServiceAffilId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "DefaultContractId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier or code from live SQL Server schema"
                  },
                  {
                    "name": "TOTALBUDGET",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "USEDBUDGET",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "IsBundled",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "trackingnumber",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "ReqTotalBudget",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  },
                  {
                    "name": "ApplyDecrement",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column pulled from live SQL Server schema"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "name": "InMemory",
        "schemas": [
          {
            "name": "dbo",
            "tables": [
              {
                "name": "MEMBER_HISTORY",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.ClaimHistory \u2192 ClaimDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.MEMBER_HISTORY.sql",
                "columns": [
                  {
                    "name": "ClaimID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "DrugName",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "DrugGenClass",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "GCNSeqNo",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "GCN",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "HICLSeqNo",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "NDC",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "RxDate",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "DateOfService",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "Quantity",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "DaysSupply",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PrescriberNPI",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "ProviderNPI",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PharmacyNPI",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PDLStatus",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PrefDrug_PREF",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PARequired",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "Dose",
                    "type": "float",
                    "length": "53",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "IsGeneric",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "NewRefill",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "IsNewRefill",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "IsBrand",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "IsPreferred",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PlanId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "CompoundIndicator",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "ProviderId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "MemberId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "ExhaustedDate",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "RxNumber",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "NdcCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PrescriberNbr",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "FillDate",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "Fill_Date",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "VacationRefillDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "CertificationNumber",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "TherapeuticClass",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "DispensingFee",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "RxDateOfService",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "CreateDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "TotalMemberAmount",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "ExternalClaimId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "RxDateWritten",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "IsEncounter",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PriorAuth",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "Dosage",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "PaidDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  },
                  {
                    "name": "FormType",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ClaimDTO"
                  }
                ]
              },
              {
                "name": "MEMBER",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails \u2192 MemberDetailsDTO (MemberDTO base)",
                "ddlFile": "in_memory_schema\\InMemory.dbo.MEMBER.sql",
                "columns": [
                  {
                    "name": "MemberID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "CardholderID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "FirstName",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "LastName",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "BirthDate",
                    "type": "date",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "DeathDate",
                    "type": "date",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Gender",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Phone",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "AgeInMonths",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "AgeInYears",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_Id",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_Address1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_Address2",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_City",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_StateProvince",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_PostalCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_CountryCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "IsInLTC",
                    "type": "bit",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "EthnicID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  }
                ]
              },
              {
                "name": "ENROLLMENT",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.Enrollments \u2192 EnrollmentDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.ENROLLMENT.sql",
                "columns": [
                  {
                    "name": "MemberId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "ProgramId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "EnrollId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "CoverageCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "BenefitPlanId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "RateCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "RateId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "SegType",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "EffectiveDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "TermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "CoverageEffectiveDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "CoverageTermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "RestrictionId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "RestrictEffectiveDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "RestrictTermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "Sequence",
                    "type": "smallint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "BenefitId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "CardholderId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  },
                  {
                    "name": "PersonCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from EnrollmentDTO"
                  }
                ]
              },
              {
                "name": "MEMBER_ATTRIBUTE",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails \u2192 MemberDetailsDTO (MemberDTO base)",
                "ddlFile": "in_memory_schema\\InMemory.dbo.MEMBER_ATTRIBUTE.sql",
                "columns": [
                  {
                    "name": "MemberID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "CardholderID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "FirstName",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "LastName",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "BirthDate",
                    "type": "date",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "DeathDate",
                    "type": "date",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Gender",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Phone",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "AgeInMonths",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "AgeInYears",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_Id",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_Address1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_Address2",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_City",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_StateProvince",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_PostalCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "Address_CountryCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "IsInLTC",
                    "type": "bit",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  },
                  {
                    "name": "EthnicID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberDetailsDTO (MemberDTO base)"
                  }
                ]
              },
              {
                "name": "DRUG",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.ClaimRequest.DrugRequested \u2192 DrugRequestedDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.DRUG.sql",
                "columns": [
                  {
                    "name": "NDC_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_LabelName",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Strength",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Route",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Dose",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_PDLStatus",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsPayable",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsBrand",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsPreferred",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsNonPreferred",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsGeneric",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_PrefDrug_PREF",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_PARequired",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MinDayDose",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxDayDose",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxRefills",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxRxDays",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxRxUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_AttrMaxRxUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_FGenCode",
                    "type": "smallint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HGenCode",
                    "type": "smallint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_LastCovidDoseCount",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_CovidEffDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_CovidTermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ps",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Gni",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Dea",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_AddNotActive",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_DisableAllPlans",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Cl",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Gpi",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ndcgi1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HcfaTrmc",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Repndc",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_SetGender",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Pd",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ud",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Df",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HcfaDesi1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Desi",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Desi2",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ln",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Bn",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HcfaTyp",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Pkgbilling",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Maxscriptdays",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MinAge",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxAge",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_DaysTillRefill",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_AttrDaysTillRefill",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCNSeqNo_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCNSeqNo_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HIC3_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HIC3_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HICLSeqNo_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HICLSeqNo_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCN_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCN_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  }
                ]
              },
              {
                "name": "DRUG_ATTR",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.ClaimRequest.DrugRequested \u2192 DrugRequestedDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.DRUG_ATTR.sql",
                "columns": [
                  {
                    "name": "NDC_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_LabelName",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Strength",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Route",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Dose",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_PDLStatus",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsPayable",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsBrand",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsPreferred",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsNonPreferred",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_IsGeneric",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_PrefDrug_PREF",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_PARequired",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MinDayDose",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxDayDose",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxRefills",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxRxDays",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxRxUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_AttrMaxRxUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_FGenCode",
                    "type": "smallint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HGenCode",
                    "type": "smallint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_LastCovidDoseCount",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_CovidEffDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_CovidTermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ps",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Gni",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Dea",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_AddNotActive",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_DisableAllPlans",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Cl",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Gpi",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ndcgi1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HcfaTrmc",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Repndc",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_SetGender",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Pd",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ud",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Df",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HcfaDesi1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Desi",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Desi2",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Ln",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Bn",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_HcfaTyp",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Pkgbilling",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_Maxscriptdays",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MinAge",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_MaxAge",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_DaysTillRefill",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "NDC_AttrDaysTillRefill",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCNSeqNo_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCNSeqNo_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HIC3_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HIC3_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HICLSeqNo_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "HICLSeqNo_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCN_Code",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  },
                  {
                    "name": "GCN_Description",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from DrugRequestedDTO"
                  }
                ]
              },
              {
                "name": "PRIOR_AUTH",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.PAHistory \u2192 MemberPAHistoryDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.PRIOR_AUTH.sql",
                "columns": [
                  {
                    "name": "ReferralId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  },
                  {
                    "name": "AuthId",
                    "type": "bigint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  },
                  {
                    "name": "SequenceId",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  },
                  {
                    "name": "TotalUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  },
                  {
                    "name": "DaysSupply",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  },
                  {
                    "name": "UsedUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  },
                  {
                    "name": "DailyDoseUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  },
                  {
                    "name": "RemainingUnits",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberPAHistoryDTO"
                  }
                ]
              },
              {
                "name": "EO_HISTORY",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.EOHistory \u2192 MemberEOHistoryDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.EO_HISTORY.sql",
                "columns": [
                  {
                    "name": "AuthorizationId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "MemberId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "CardHolderId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "PrescriberNPI",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "PharmacyNPI",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "StartDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "EndDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "Status",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "NDCKey",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "GCNSeqNo",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "Quantity",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "DaysSupply",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "IT_CNT",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  },
                  {
                    "name": "RejectEdits_EditId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from MemberEOHistoryDTO"
                  }
                ]
              },
              {
                "name": "EVENT",
                "coverage": "unresolved",
                "reason": "Mapped as InRuleDTO.ClaimRequest.DUREvents \u2192 DUREventDTO, but all three authorities explicitly provide no DUREventDTO properties; no DDL was fabricated",
                "ddlFile": "",
                "columns": []
              },
              {
                "name": "SCHEDULEII",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.ScheduleIIs \u2192 ScheduleIIDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.SCHEDULEII.sql",
                "columns": [
                  {
                    "name": "ClaimId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "MemberId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "ProviderId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "NDC",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "RXNumber",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "ServiceDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "PrescriptionDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "QuantityPrescribed",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "QuantityDispensed",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "FillsAuthorized",
                    "type": "int",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  },
                  {
                    "name": "CreateDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ScheduleIIDTO"
                  }
                ]
              },
              {
                "name": "PROVIDER",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.ClaimRequest.Provider \u2192 ProviderDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.PROVIDER.sql",
                "columns": [
                  {
                    "name": "ID",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "NPI",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "Name",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "ProviderType",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "ProviderTypeCode",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "Status",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "Phone",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "Specialty",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "CredentialStatus",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "Email",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "OIG",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "PlanProviderId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "DEA",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "PhysicalAddress1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "PhysicalAddress2",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "PhysicalCity",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "PhysicalState",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "PhysicalZip",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "MailingAddress1",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "MailingAddress2",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "MailingCity",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "MailingState",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "MailingZip",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "ExternId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "GpciId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "OverrideRoleId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "ExternalEditing",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "MedicarePar",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "PoaExempt",
                    "type": "bit",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "EntityId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "CoverageType",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "ClaimType",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  },
                  {
                    "name": "ProviderClass",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ProviderDTO"
                  }
                ]
              },
              {
                "name": "CONTRACT_TERM",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.ClaimRequest.ContractTerms \u2192 ContractTermDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.CONTRACT_TERM.sql",
                "columns": [
                  {
                    "name": "ContractId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ContractTermDTO"
                  },
                  {
                    "name": "TermId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ContractTermDTO"
                  },
                  {
                    "name": "Status",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ContractTermDTO"
                  },
                  {
                    "name": "ProvType",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ContractTermDTO"
                  },
                  {
                    "name": "EffDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ContractTermDTO"
                  },
                  {
                    "name": "TermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from ContractTermDTO"
                  }
                ]
              },
              {
                "name": "PLAN_AFFILIATIONS",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.PlanAffiliations \u2192 PlanAffiliationDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.PLAN_AFFILIATIONS.sql",
                "columns": [
                  {
                    "name": "AffiliationId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ProviderId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "AffiliateId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "AffiliateType",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "Status",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PayFlag",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "EffectiveDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "TermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PlanProgramId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PlanPCP",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PlanFeeId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PlanEffectiveDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PlanTermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ContractProgramId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ContractId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ContractEffectiveDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ContractTermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ContractCopcTermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PlanProviderId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ContractNetworkId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ProviderEntityId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "AffiliateZip",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "AffiliatePhyZip",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "AffiliateState",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ServiceLocationId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "Contracted",
                    "type": "bit",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ApplyDifferential",
                    "type": "bit",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "NetworkPayPercent",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "IsRlgExcluded",
                    "type": "bit",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "ContractPaymentBundle",
                    "type": "bit",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  },
                  {
                    "name": "PlanPaymentBundle",
                    "type": "bit",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanAffiliationDTO"
                  }
                ]
              },
              {
                "name": "BENEFITS",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.PlanDrugBenefits \u2192 PlanDrugBenefitDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.BENEFITS.sql",
                "columns": [
                  {
                    "name": "PlanId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanDrugBenefitDTO"
                  },
                  {
                    "name": "BenefitId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanDrugBenefitDTO"
                  },
                  {
                    "name": "LimitAmount",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanDrugBenefitDTO"
                  },
                  {
                    "name": "AgeMin",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanDrugBenefitDTO"
                  },
                  {
                    "name": "AgeMax",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanDrugBenefitDTO"
                  },
                  {
                    "name": "EffectiveDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanDrugBenefitDTO"
                  },
                  {
                    "name": "TermDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PlanDrugBenefitDTO"
                  }
                ]
              },
              {
                "name": "PARTIAL",
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset: InRuleDTO.MemberDetails.PartialClaimHistory \u2192 PartialHistoryDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.PARTIAL.sql",
                "columns": [
                  {
                    "name": "ClaimId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "Provid",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "MemId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "RxNumber",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "NewRefill",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "MetricQty",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "DaysSupply",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "Ndc",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "RxDate",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "GCN",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "GCN_SeqNo",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "TherapeuticClass",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "Dos",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "RxDateWritten",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "CertificationMbr",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "MatchingClaimId",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "DispensingStatus",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "IntendedQuantityToBeDispensed",
                    "type": "decimal",
                    "length": "29,9",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "IntendedDaysSupply",
                    "type": "int",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "AssociatedPrescriptionRefNumber",
                    "type": "nvarchar",
                    "length": "max",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  },
                  {
                    "name": "AssociatedDateOfService",
                    "type": "datetime2",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "DTO-derived property from PartialHistoryDTO"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "name": "IPA",
        "schemas": [
          {
            "name": "dbo",
            "tables": [
              {
                "name": "DiagCode",
                "coverage": "covered",
                "reason": "Schema found in local DED workbook",
                "ddlFile": "by_database\\IPA\\IPA.dbo.DiagCode.sql",
                "columns": [
                  {
                    "name": "codegroup",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Code group associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "codeid",
                    "type": "char",
                    "length": "8",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Code identifier associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "createdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Creation date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "description",
                    "type": "varchar",
                    "length": "255",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Description associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "effdate",
                    "type": "smalldate\ntime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Effective date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "grouper",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Grouper associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "icd9type",
                    "type": "char",
                    "length": "15",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "ICD 9 type associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "IcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "ICD version associated with the Diagnosis Code entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "createid",
                    "type": "varchar",
                    "length": "120",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who created the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "updateid",
                    "type": "varchar",
                    "length": "120",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier of the user who last updated the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "requirepoa",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if POA is required for the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "lastupdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Last updated date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "longdescription",
                    "type": "text",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Long description associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "termdate",
                    "type": "smalldate\ntime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Termination date associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  },
                  {
                    "name": "theyear",
                    "type": "char",
                    "length": "4",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Year associated with the DiagCode entry, used for healthcare claims, IPA rule evaluation, validation, or audit tracking"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

export function getSchemaConfig(tenantId = DEFAULT_SCHEMA_TENANT) {
  return SCHEMA_CONFIG[tenantId] || SCHEMA_CONFIG[DEFAULT_SCHEMA_TENANT];
}

export function listSchemaTables(tenantId = DEFAULT_SCHEMA_TENANT) {
  const config = getSchemaConfig(tenantId);

  return config.databases.flatMap((database) =>
    database.schemas.flatMap((schema) =>
      schema.tables.map((table) => database.name + "." + schema.name + "." + table.name)
    )
  );
}
