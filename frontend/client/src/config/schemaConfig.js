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
                    "description": "Primary key of the claim table. This can be auto populated by idsequencer or entered by a user."
                  },
                  {
                    "name": "referralid",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "This is the referral/prior auth that was given before the member received services. This will only be populated on claims that had referrals. Links to referral.referralid"
                  },
                  {
                    "name": "enrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "The enrollid of the member that will be used to calculate the benefits for this member for the specific claim. Links to enrollment.enrollid"
                  },
                  {
                    "name": "affiliationid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Specifies the pay to provider for the claim. Links to affiliation.affiliationid and then to provider on affiliateid. Displays the provider name."
                  },
                  {
                    "name": "facilitycode",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Provides specific information about the hospital bill. The first digit of the three digit number identifies the type of facility. The second digit classifies the type of care being billed. The third digit indicates the sequence of the bill for a specific"
                  },
                  {
                    "name": "memid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "The memberid of the person the claim is for. This links back to member.memid."
                  },
                  {
                    "name": "billclasscode",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Provides specific information about the hospital bill. The first digit of the three digit number identifies the type of facility. The second digit classifies the type of care being billed. The third digit indicates the sequence of the bill for a specific"
                  },
                  {
                    "name": "frequencycode",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Provides specific information about the hospital bill. The first digit of the three digit number identifies the type of facility. The second digit classifies the type of care being billed. The third digit indicates the sequence of the bill for a specific"
                  },
                  {
                    "name": "startdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Dates service began for this claim. All claimdetail records for this claim must be between this date and the end date."
                  },
                  {
                    "name": "enddate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Last date of service was given for this claim. All claimdetail records for this claim must be between this date and the end date."
                  },
                  {
                    "name": "controlnmb",
                    "type": "char",
                    "length": "20",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Field is a user defined field usually used by providers as a patient billing number."
                  },
                  {
                    "name": "admitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Admission date for entry in claim"
                  },
                  {
                    "name": "admithour",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Hour of patient admission"
                  },
                  {
                    "name": "medrecnmb",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Number assigned by the provider to the patients medical of health record. QNXT 3.6 Expanded to char(30) for UB04"
                  },
                  {
                    "name": "payer",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Name of Payer (health Plan)"
                  },
                  {
                    "name": "relinfo",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Flag saying if information can be released for the member."
                  },
                  {
                    "name": "admittype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Admission Type on UB92 : Indicates the priority of the inpatient admission."
                  },
                  {
                    "name": "asgben",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Assigned benefits check box on claim . 2.4 (070): Changed default to 'N' (Also Rolled back to 2.0)"
                  },
                  {
                    "name": "admitsource",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Admission Source on UB92, indicates the source of the admission or outpatient service"
                  },
                  {
                    "name": "priorpay",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Prior Payments made by member/plan"
                  },
                  {
                    "name": "patientstatus",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates patients disposition as of the ending date of service for the period of care reported"
                  },
                  {
                    "name": "estamtdue",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Estimated amount due on claim form"
                  },
                  {
                    "name": "esc",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "User defined field and can be used as a reinsurance number"
                  },
                  {
                    "name": "reason",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "User defined field. Free form entry."
                  },
                  {
                    "name": "plancrn",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Claim number as assigned by external entity (typically State/Federal agency)"
                  },
                  {
                    "name": "plansubdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Date the claim was submitted to external organization"
                  },
                  {
                    "name": "eligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total dollar amount that is eligible for the claim."
                  },
                  {
                    "name": "totaldeduct",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total deductible from the sum of the deductibles of the claimdetail lines. Calculated during adjudication"
                  },
                  {
                    "name": "remitno",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Remit number associated with claim. Populated when you run remits."
                  },
                  {
                    "name": "adjuddate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Adjudication Date of the claim"
                  },
                  {
                    "name": "logdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The date the claim was logged for processing. This field is used to calculate quick pay discounts/ late pay surcharges (If applied to the contract). The pay date (Date FFS payment is generated) less the claim.logdate calculates the number of days for this"
                  },
                  {
                    "name": "cleandate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date a claim becomes ready for processing with no additional documents required."
                  },
                  {
                    "name": "orgclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Original claimid. This is placed on the claim you are reversing from."
                  },
                  {
                    "name": "attendphyid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Attending provider identifier. Foreign key to provider"
                  },
                  {
                    "name": "resubclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "If claim is reversed, this field will contain the ID of the claim reversal"
                  },
                  {
                    "name": "formtype",
                    "type": "typecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Type of claim form being utilized for the claim.This is generally defined by the providers provider type definition. (Claimtype field in the providertype table)"
                  },
                  {
                    "name": "plansubmit",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "For reporting only and will send an encounter report to the line of business. Values 1=Yes, 0= No"
                  },
                  {
                    "name": "otherphyid1",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Additional provider identifier"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was last updated"
                  },
                  {
                    "name": "otherphyid2",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Additional provider2 identifier"
                  },
                  {
                    "name": "provrep",
                    "type": "nametype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Provider Representative"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who last updated this record"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who created this record"
                  },
                  {
                    "name": "provrepdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Provider Submission Date"
                  },
                  {
                    "name": "totalamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "This field indicates the total amount of charges on the claim form"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was created"
                  },
                  {
                    "name": "attendphyname",
                    "type": "shortdesctype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifies the name of the licensed physician who normally is expected to certify and recertify medical necessity of the services rendered and / or has the primary responsibility for the patients medical care and treatment"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status of the claim. (I.E. Log, Open, Adjudicated, Pend, Pay, Deny, Reverse, Waitpay, Waitdeny, Waitrev, Paid, Denied, and Reversed, etc)"
                  },
                  {
                    "name": "planid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "The benefit plan that the member has. This is populated from the enrollment.planid field. This will be used in calculating the members benefits."
                  },
                  {
                    "name": "eobamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount submitted as coordination of benefits dollar amount. Will be calculated based on system setup."
                  },
                  {
                    "name": "eobeligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Dollar amount eligible for payment after applying cob amount"
                  },
                  {
                    "name": "totalpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total paid on the claim. Is populated when adjudication is run. This is not displayed on the Claim Summary screen even though the UI says Total Paid. It is on the Pay tab."
                  },
                  {
                    "name": "emergency",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : MOVED TO CLAIMDETAIL RECORD : Indicates claim is for an emergency situation"
                  },
                  {
                    "name": "contractid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "The contract that is associated with the paytoprovider. This contract information will be used to calculate the contract dollars for the claim"
                  },
                  {
                    "name": "paiddate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Dater the claim completed the payment process. The field is only visible after the claim has been processed through create FFS Payment. Field will remain null until payment is processed."
                  },
                  {
                    "name": "drg",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Diagnostic Related Grouping code submitted by hospital for Medicare reimubursement"
                  },
                  {
                    "name": "userinitials",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : Initials of user that last updated the claim entry"
                  },
                  {
                    "name": "okpaydate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date the claim was marked ok to move through payment process. This field is only visible after the claim has been marked OK."
                  },
                  {
                    "name": "provid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Provider id of the provider submitting the claim."
                  },
                  {
                    "name": "okpayby",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Login of the user that marked the claim ok to move through payment process"
                  },
                  {
                    "name": "claimbypcp",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Flag used to determine if claim was submitted by the members PCP. This is calculated by matching the provid and memid to the memberpcp table. Values '0' = No , '1' = Yes , '-1' = Yes"
                  },
                  {
                    "name": "shareofcost",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Member's share of cost for this claim (LCLAIM claims ONLY)"
                  },
                  {
                    "name": "dischargehour",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The hour during which the patient was discharged from inpatient care"
                  },
                  {
                    "name": "haspool",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "If the member has a pool associated with the contract then this will be set to yes. Set during adjudication. Values 'N' = No, 'Y' = Yes"
                  },
                  {
                    "name": "ffspoolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The risk poolid (riskpool.riskpoolid) associated with this claim and it is only populated when the ffs risk pool is defined at the contract level. If riskpools are defined at the contract term level the risk pools are only available at the claim line lev"
                  },
                  {
                    "name": "ffspoolamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Sum of the FFS pool amount on the claim line (claimdetail.ffspoolamt)"
                  },
                  {
                    "name": "outofarea",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Will indicate that the claim is out of normal service area. Values \"Y\" = Yes, \"N\" = No"
                  },
                  {
                    "name": "covereddays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Number of inpatient days covered by the primary payer"
                  },
                  {
                    "name": "noncovereddays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Number of days of care NOT covered by the primary payer"
                  },
                  {
                    "name": "coinsurancedays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Inpatient MEDICARE days occurring after the 60th day and before the 91st day in a single spell of illness."
                  },
                  {
                    "name": "lifereservedays",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Under MEDICARE, each beneficiary has a lifetime reserve of 60 days of inpatient hospital services after using 90 days of inpatient hospital services during a spell of illness."
                  },
                  {
                    "name": "isencounter",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "If selected will set services to capitated. It will override the contract even if there are FFS lines. Values \"Y\" = Yes, \"N\" = No"
                  },
                  {
                    "name": "serviceaffilid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The facility that the service is being provided at. This may not be necessary on all claims"
                  },
                  {
                    "name": "dischargedate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "If services submitted in this claim were performed while the patient was confined in a health care facility, the ending date of confinement"
                  },
                  {
                    "name": "isemployment",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "A yes/no field to indicate whether the patient alleges that his/her medical condition is due to the environment or events resulting from employment"
                  },
                  {
                    "name": "isautoaccident",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "A yes/no field to indicate whether the patient's condition was the result of an auto accident"
                  },
                  {
                    "name": "isotheraccident",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "A yes/no field to indicate whether the patient's condition was the result of other, non-auto accident"
                  },
                  {
                    "name": "dateonset",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date the illness or injury happened or started."
                  },
                  {
                    "name": "similarillnessdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "The previous date that the patient experienced symptoms similar or identical to those for which services submitted on this claim were rendered"
                  },
                  {
                    "name": "accidentstate",
                    "type": "statetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "State Postal Code identifying the state in which the automobile accident occurred"
                  },
                  {
                    "name": "manualencounter",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates If the user verifies that this was not a manual encounter. Values 'Y' Yes, 'N' no"
                  },
                  {
                    "name": "isepsdt",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : MOVED TO CLAIMDETAIL : Is epsdt flag"
                  },
                  {
                    "name": "initialprothesis",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines if I-Initial or R-Replacement of prothesis"
                  },
                  {
                    "name": "priorprothesisdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date of prior prothesis"
                  },
                  {
                    "name": "isorthodontics",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates of claim is orthodontic related"
                  },
                  {
                    "name": "orthoappldate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date orthodontics were applied"
                  },
                  {
                    "name": "orthomosrem",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Dental - Number of months remaining in treatment"
                  },
                  {
                    "name": "totalreimburseamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total reimbursement dollar amount. Calculated during adjudication"
                  },
                  {
                    "name": "hasdocuments",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates that documents were submitted with this claim."
                  },
                  {
                    "name": "referfrom",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "This is the provid of the physician the member was referred from. This links to provider.provid."
                  },
                  {
                    "name": "isstoploss",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Selected to indicate if there is stop loss associated with the claim. (Y/N)"
                  },
                  {
                    "name": "totalrefundamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total dollar amount refunded by the provider during a reversal."
                  },
                  {
                    "name": "planresub",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates that claim should be resubmitted to carrier to reflect adjustment"
                  },
                  {
                    "name": "planresubdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date that claim was resubmitted to carrier. Comes from the claim.startdate field of the claim that is listed on the original claim in the claim.resubclaimid field."
                  },
                  {
                    "name": "hascareplan",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicatees if a careplan exits for claim"
                  },
                  {
                    "name": "reimbursemember",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "If selected will pay the member rather than the provider."
                  },
                  {
                    "name": "totalsubmitdiscount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total discounts based on dollar amount submitted and quick pays,"
                  },
                  {
                    "name": "totaladdlmemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "How much more the member is responsible to pay. Calculated during adjudicate. Done on manual pricing."
                  },
                  {
                    "name": "totalmemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "How much the member is responsible for our of total claim. This includes copay's and deductibles."
                  },
                  {
                    "name": "importfinal",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED"
                  },
                  {
                    "name": "payeeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED : For alternate payment purposes this will be the memberid of the member that will be paid for this claim."
                  },
                  {
                    "name": "claimsourceid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Stores where claim was created from. Manual entry or EDI"
                  },
                  {
                    "name": "carryoverintdays",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the number of days for interest calculations to be carried over from a claim that has been denied to an adjustment claim"
                  },
                  {
                    "name": "externalenrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "External COB enrollment attached to the claim. Defines relationship and type of COB being processed in adjudication which effects the COB calculation"
                  },
                  {
                    "name": "paycobbyline",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "If (Y)es then adjudication will calculate and pay the COB on a line by line basis. If (N)O then adjudication will calculate and pay the COB on a claim basis."
                  },
                  {
                    "name": "totextdeductamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total claim external insurance deductable amount. Used in determining secondary payment in COB process."
                  },
                  {
                    "name": "totextcopayamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total claim external insurance copay amount. Used in determining secondary payment in QMACS COB process."
                  },
                  {
                    "name": "totextcoinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total claim external insurance coinsurance amount. Used in determining secondary payment in QMACS COB process."
                  },
                  {
                    "name": "totextpaidamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total claim external insurance paid amount. Used in determining secondary payment in QMACS COB process. COB Screen-Total Paid Amount"
                  },
                  {
                    "name": "interestdays",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The number of days used to calculate interest."
                  },
                  {
                    "name": "cobsavings",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Holds the COB Savings generated as a result of the claim dental lines in this claim"
                  },
                  {
                    "name": "isitsclaim",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Used to determine if a claim is an ITS claim (N)o - Isn't an ITS Claim (H)ome - Claim is on the Home plan (Yours) Hos(T) - Claim is on a Host Plan (i.e. you are out of state and visit a doctor with a BCBS contract)"
                  },
                  {
                    "name": "forcedbeneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Primary key from the for the benepreference table. Populated with the preferred benefit id."
                  },
                  {
                    "name": "adjudbeneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Primary key from the for the benepreference table. Populated with the preferred benefit id during adjudication"
                  },
                  {
                    "name": "determiningclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Primary key of the claim table. This is populated with a claimid that is used in calculating this claim"
                  },
                  {
                    "name": "eobreceived",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if an EOB was received for a claim"
                  },
                  {
                    "name": "isbasesupplemental",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Column indicates whether claim was adjudicated using base\\supplemental processing"
                  },
                  {
                    "name": "privacypayeeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Payeeid to pay for member reimbursement REFERENCES member(memid)"
                  },
                  {
                    "name": "suppresseob",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if the Explanation of Benefits (EOB) is not issued"
                  },
                  {
                    "name": "cobsavingsapplied",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "COB credit reserve savings are applied at this claim"
                  },
                  {
                    "name": "calccobbyline",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates how COB calculated: (C)laim, (L)ine by line, (' ') Not set"
                  },
                  {
                    "name": "haslien",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if the claim has a lien (Y/N)"
                  },
                  {
                    "name": "hasrefundrequest",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Refund has been requested from provider/member"
                  },
                  {
                    "name": "mspclaim",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (020): Indicates if this record is for a Medicare Secondary Payee (MSP) claim"
                  },
                  {
                    "name": "msppayeeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "2.6 (020): Medicare payee identifier from carrier table that will be reimbursed up to the total amount they paid as primary."
                  },
                  {
                    "name": "reimbursemedicareamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (020): The dollar amount to reimburse to medicare for a claim that they paid as primary in error."
                  },
                  {
                    "name": "reject",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (037): If edit is deny and reject is 'Y' then indicates it is a rejected claim"
                  },
                  {
                    "name": "reimbursecopayamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (039): The copay dollars the member needs to be reimbursed for because the member met their max out of pocker or maximum coinsured charge and no longer pays a copy."
                  },
                  {
                    "name": "mempaidamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (039): The amount the member has paid the provider for this claim. The UB92 claim field is: \"Prior Paid\" (BOX 54). The 1500 field is\" \"Amt Paid\" (Box 29)."
                  },
                  {
                    "name": "exportdate837",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (057): Date external priced claim was exported via 837 from pricing"
                  },
                  {
                    "name": "externalpricing",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (057): Indicator that determinesif claim was externally priced"
                  },
                  {
                    "name": "importdate837",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (057): Date external priced claim was imported via 837"
                  },
                  {
                    "name": "externaldcn",
                    "type": "varchar",
                    "length": "50",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (057): External document control number"
                  },
                  {
                    "name": "networkaffilid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (057): External/Internal network affiliation to use for pricing."
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
                    "description": "Status of this claim in MyHealthView system"
                  },
                  {
                    "name": "isrepricingclaim",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if this claim is a repricing claim. If so there are different rules for adjudication. (i.e. no enrollment, no member, etc)"
                  },
                  {
                    "name": "rebilltotalamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Total rebill carrier amount for claim, calculated by adding up the rebill carrier amounts for each claim line that qualifies as a rebill claim line. If this is set to Null then this is not a rebill carrier claim."
                  },
                  {
                    "name": "rebillreleasedate",
                    "type": "udtshortdate",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date that the rebill carrier claim will be released for payment. - If the claim is not a rebill Carrier claim, no hold on provider payment, this is set to Null and the status of the claim is set to Pay. If rebillholdpayment = N, no hold on provider paymen"
                  },
                  {
                    "name": "otherphyid1name",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "The name stored for the other physician 1 from a claim form. The other physician one column is used to store other types of physicians associated with a claim such as OPERATING."
                  },
                  {
                    "name": "otherphyid2name",
                    "type": "varchar",
                    "length": "60",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "The name stored for the other physician 2 from a claim form. The other physician one column is used to store other types of physicians associated with a claim such as OPERATING."
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
                    "description": "Indicates if the claim is missing information that stopped the claim from adjudicating successfully."
                  },
                  {
                    "name": "contractnetworkid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Network identified during adjudication, which will enable payment to quickly find the correct contractinfo record with the 'requestrefund' column and process accordingly. The rest of the contractinfo key is already available."
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
                    "description": "Document control number used to identify the associated paper claim in Filenet"
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
                    "description": "Primary key of the claim table"
                  },
                  {
                    "name": "claimline",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Claim Detail line number"
                  },
                  {
                    "name": "referralid",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "This is not the Primary key of the referral table. 2.6 (005): Expand to char(30). The referralid in this table matches to the referral.authorizationid field. Verified in the ME Lab environment. The custom auth auto-match code populates claimdetail.refe"
                  },
                  {
                    "name": "revcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Revenue code for the claimdetail line"
                  },
                  {
                    "name": "contractid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Contract Identifier for the claimdetail lin"
                  },
                  {
                    "name": "termid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Contractterm Identifier for the claimdetail line"
                  },
                  {
                    "name": "planid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Plan identifier for the claimdetail line"
                  },
                  {
                    "name": "benefitid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Benefit Identifier for the claimdetail line"
                  },
                  {
                    "name": "servunits",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total units billed for a service line"
                  },
                  {
                    "name": "total",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total submitted by provider for reimbursement"
                  },
                  {
                    "name": "servcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Service code for the claimdetail line"
                  },
                  {
                    "name": "modcode",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Modifier code for the claimdetail line"
                  },
                  {
                    "name": "dosfrom",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "First date of service for the claimdetail line"
                  },
                  {
                    "name": "dosto",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Second date of service for the claimdetail line"
                  },
                  {
                    "name": "location",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Place of Service"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status of the entry in claimdetail"
                  },
                  {
                    "name": "claimamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount of the claim"
                  },
                  {
                    "name": "conteligamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Contract Eligible Amount"
                  },
                  {
                    "name": "amountpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount paid entry in claimdetail"
                  },
                  {
                    "name": "deductible",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Deductible amount on the detail line"
                  },
                  {
                    "name": "plancrn",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Claim number as assigned by external entity (typically State/Federal agency)"
                  },
                  {
                    "name": "contractpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount to pay per the provider contract"
                  },
                  {
                    "name": "benefitamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Benefit amount"
                  },
                  {
                    "name": "contractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Contract Amount"
                  },
                  {
                    "name": "capitated",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates that the service was capitated"
                  },
                  {
                    "name": "submitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date claim was submitted to external entity"
                  },
                  {
                    "name": "plansub",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NOT USED"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was last updated"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who last updated this record"
                  },
                  {
                    "name": "prindiag",
                    "type": "udtdiagcode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Principle diagnostic code for the claimdetail line"
                  },
                  {
                    "name": "emergency",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Is the claimdetail line associated with an emergency room visit"
                  },
                  {
                    "name": "cob",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if line item has coordination of benefits. Values 0=no, 1= yes"
                  },
                  {
                    "name": "epsdt",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "If set, indicates this service is related to epsdt treatment"
                  },
                  {
                    "name": "typesrv",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Type of service"
                  },
                  {
                    "name": "ineligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount claimed that was deemed ineligible"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was created"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who created this record"
                  },
                  {
                    "name": "cobamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount paid by coordination of benefit carrier"
                  },
                  {
                    "name": "userinitials",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Initials of user that last updated the claimdetail entry"
                  },
                  {
                    "name": "copay",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Member's copay for this service"
                  },
                  {
                    "name": "adjudicate",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Adjudication Date of the claim"
                  },
                  {
                    "name": "costshareamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Member's Costshare for this service"
                  },
                  {
                    "name": "costshareper",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Member's cost share % for this service"
                  },
                  {
                    "name": "contpercent",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Contract Percentage applied"
                  },
                  {
                    "name": "benepercent",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Benefit Percentage paid by plan"
                  },
                  {
                    "name": "remvisits",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Remaining visits"
                  },
                  {
                    "name": "maxvisits",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Maximum number of visits"
                  },
                  {
                    "name": "network",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "network with which this provider was affiliated"
                  },
                  {
                    "name": "benededuct",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Benefit deductible amount"
                  },
                  {
                    "name": "annualaccrual",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Accrued annual benefit amount"
                  },
                  {
                    "name": "lifetimeaccrual",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Accrued lifetime amount"
                  },
                  {
                    "name": "maxoutaccrual",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Accrued Max out of pocket amount"
                  },
                  {
                    "name": "coscode",
                    "type": "catservice",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Category of Service stamp on the claimdetail line"
                  },
                  {
                    "name": "catexp",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Category of expense stamp on the claimdetail record"
                  },
                  {
                    "name": "paydiscount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Pay discount amount"
                  },
                  {
                    "name": "subcat",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Sub Category of Expense code"
                  },
                  {
                    "name": "beneinelig",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Benefit ineligible amount"
                  },
                  {
                    "name": "riderid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Primary key of the rider table"
                  },
                  {
                    "name": "carelevel",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Level of Care provided to LCLAIM members"
                  },
                  {
                    "name": "medcoverage",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Medicare coverage for LCLAIM members"
                  },
                  {
                    "name": "fracunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Fractional Units if applicable for the claimdetail line"
                  },
                  {
                    "name": "authunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Authorized units"
                  },
                  {
                    "name": "poolamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount applied to risk pool"
                  },
                  {
                    "name": "haspool",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Has pool flag for claimdetail"
                  },
                  {
                    "name": "poolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Primary key of the riskpool table"
                  },
                  {
                    "name": "fundid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Primary key of the fund table"
                  },
                  {
                    "name": "ffspoolid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Fee for service pool identifier"
                  },
                  {
                    "name": "ffspoolamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Fee for service pool amount"
                  },
                  {
                    "name": "toothnumber",
                    "type": "toothtype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Dental - tooth number for service selected."
                  },
                  {
                    "name": "toothsurface",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Tooth surface description that is covered under this service"
                  },
                  {
                    "name": "reimburseamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Reimbursement amount"
                  },
                  {
                    "name": "billservcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Service code that was billed on claim line"
                  },
                  {
                    "name": "approvedservcode",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Service code that was approved for claim line"
                  },
                  {
                    "name": "refundamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount refunded for this claim line"
                  },
                  {
                    "name": "submitdiscount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Submission discount for claim line"
                  },
                  {
                    "name": "modcode2",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2nd Modifier code"
                  },
                  {
                    "name": "modcode3",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "3rd Modifier code"
                  },
                  {
                    "name": "addlmemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Additional member amount"
                  },
                  {
                    "name": "memamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Member amount"
                  },
                  {
                    "name": "diag1",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "1st diagnosis code"
                  },
                  {
                    "name": "diag2",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2nd diagnosis code"
                  },
                  {
                    "name": "diag3",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "3rd diagnosis code"
                  },
                  {
                    "name": "diag4",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "4th diagnosis code"
                  },
                  {
                    "name": "globalcovthrudate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "This is populated during adjudication and dictates how long it will be until the provider can submit a claim for this member for this service again."
                  },
                  {
                    "name": "modcode4",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "4th modecode"
                  },
                  {
                    "name": "modcode5",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "5th modecode"
                  },
                  {
                    "name": "multmodtiercount",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Multiple modifier tier count 1 for claim line with a tiered modifier in the modecode column."
                  },
                  {
                    "name": "multmodtiercount2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Multiple modifier tier count 2 for claim line with a tiered modifier in the modecode column."
                  },
                  {
                    "name": "multmodtiercount3",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Multiple modifier tier count 3 for claim line with a tiered modifier in the modecode column."
                  },
                  {
                    "name": "multmodtiercount4",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Multiple modifier tier count 4 for claim line with a tiered modifier in the modecode column."
                  },
                  {
                    "name": "multmodtiercount5",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Multiple modifier tier count 5 for claim line with a tiered modifier in the modecode column."
                  },
                  {
                    "name": "coinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount of deference benefitamt and benefit amt * benefit percentage."
                  },
                  {
                    "name": "copayperdiemamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount of copay perdiem change is applied towards member."
                  },
                  {
                    "name": "ispricebyauth",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines how the claimline is priced: Y: use the authorization contract, term and term amount. N: use standard contract adjudication method"
                  },
                  {
                    "name": "cobeligibleamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the COB eligible dollar amount"
                  },
                  {
                    "name": "medicareactioncode",
                    "type": "char",
                    "length": "8",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Action code for medicare"
                  },
                  {
                    "name": "isclaimauthloc",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines if detail record has a claimauthloc record."
                  },
                  {
                    "name": "prioramtpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Prior amount paid on claim."
                  },
                  {
                    "name": "authline",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates which auth line claim is validating against."
                  },
                  {
                    "name": "redcoinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Provider specific reduced coinsurance amount per APC pricing system."
                  },
                  {
                    "name": "origbeneclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Primary key of the claim table"
                  },
                  {
                    "name": "origbeneadmitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Original admit date for the benefit period"
                  },
                  {
                    "name": "membmaxfeeamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Amount member is responsible to pay that is over the benefit maximum fee"
                  },
                  {
                    "name": "paymentapc",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores APC codes received from microdyn's APCactive enterprise pricer for enhanced"
                  },
                  {
                    "name": "hcpcsapc",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the HCPCS APC code"
                  },
                  {
                    "name": "extdeductamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "External insurance deductable amount. Used in determining secondary payment in QMACS COB process."
                  },
                  {
                    "name": "extcopayamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "External insurance copay amount. Used in determining secondary payment in QMACS COB process."
                  },
                  {
                    "name": "extcoinsuranceamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "External insurance coinsurance amount. Used in determining secondary payment in QMACS COB process."
                  },
                  {
                    "name": "extpaidamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "External insurance paid amount. Used in determining secondary payment in QMACS COB process."
                  },
                  {
                    "name": "allocatedvisits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Number of visits used for this service line"
                  },
                  {
                    "name": "billedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Original billed units submitted on the claim"
                  },
                  {
                    "name": "cobsavingsappliedamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the COB savings applied to the claimdetail line"
                  },
                  {
                    "name": "allowedamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the dollar amount used as the allowed amount for the basis of the COB calculation."
                  },
                  {
                    "name": "payasstatus",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if claimdetail was paid using P - Primary or S - Seconday calculation"
                  },
                  {
                    "name": "beneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Primary key of the benepreference table"
                  },
                  {
                    "name": "employerfeeamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Employer Fee Schedule Amt"
                  },
                  {
                    "name": "detailsourcetype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Source type of a claim service line (B) From Claim Check Rebundling (C) From Claim Check Replacement Code"
                  },
                  {
                    "name": "penaltyamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Non-Compliance Penalty Amount - Member Responsible for"
                  },
                  {
                    "name": "cobsavingsamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the COB savings accumulated from the line."
                  },
                  {
                    "name": "payasprimary",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if system should bypass the COB calculation for a claim line"
                  },
                  {
                    "name": "autofillauth",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines if Authorizations will be automatically filled during adjudication"
                  },
                  {
                    "name": "provresppenaltyamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Non-Compliance Penalty Amount - Provider Responsible for"
                  },
                  {
                    "name": "accomodationrate",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Inpatient Rehabilition Facility (IRF) accommodation rate"
                  },
                  {
                    "name": "hhppsoutlieramt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Home health prospective payment system outlier payment amount (calculated)."
                  },
                  {
                    "name": "claimsubdetailtype",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates the type of claimsubdetail included in claimdetail LOC = Level of care, BS = Base/Major Medical"
                  },
                  {
                    "name": "modcodepreadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ."
                  },
                  {
                    "name": "modcode2preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ."
                  },
                  {
                    "name": "modcode3preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ."
                  },
                  {
                    "name": "modcode4preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ."
                  },
                  {
                    "name": "modcode5preadjud",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the value of the matching claimline modifier as it existed before adjudication if still set to the default of ZZ."
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
                    "description": "5th diagnosis code"
                  },
                  {
                    "name": "diag6",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "6th diagnosis code"
                  },
                  {
                    "name": "diag7",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "7th diagnosis code"
                  },
                  {
                    "name": "diag8",
                    "type": "char",
                    "length": "2",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "8th diagnosis code"
                  },
                  {
                    "name": "overridecontractpaid",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Overriden contract paid amount"
                  },
                  {
                    "name": "overridecontractid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "X",
                    "description": "Overridden contract id - REFERENCES contract (contractid)"
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
                    "description": "2.4 (065): Amount of the differential adjustment"
                  },
                  {
                    "name": "startingcontractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.4 (065): Amount of provider contract before any adjustments are applied"
                  },
                  {
                    "name": "initialclaimid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "2.4 (135): The initial claim identifer used to create this service line"
                  },
                  {
                    "name": "initialclaimline",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "2.4 (135): The initial claim line used to create this service line"
                  },
                  {
                    "name": "umapprovedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (010): Stores the number of UM Document approved service units at the time of claim adjudication"
                  },
                  {
                    "name": "memrespcharges",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (051): If the member responsibility has been calculated based on charges the this field with contain a value of Y."
                  },
                  {
                    "name": "externalcontractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (057): The externally priced contract amount"
                  },
                  {
                    "name": "internalcontractamt",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.6 (057): The internally priced contract amount"
                  },
                  {
                    "name": "copaygroupid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "X",
                    "description": "2.6 (070): References copaygroup. Stores the copaygroupid on the claimline if the copay on the claim line is applied using a copay preference group."
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
                    "description": "Rebill amount for the claim line. It is based on 100% of the fee schedule defined on the program for rebill carrier and is an amount field and not a percentage of a fee."
                  },
                  {
                    "name": "anesminutes",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Number of anesthesia minutes passed in from an imported claim or entered during manual claim entry. On manual claim entry either a datetime span (converted to minutes by app) or the actual minutes can be entered."
                  },
                  {
                    "name": "hasndccode",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if this claimdetail records has NDC Code records that are attached to it."
                  },
                  {
                    "name": "dtlmissinginfo",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if the claim line is missing information that stopped the claim line from adjudicating successfully."
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
                    "description": "Diagnosis ICD Version, '9' for ICD-9 and '0' for ICD-10"
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
                    "description": "Primary key of the referral table"
                  },
                  {
                    "name": "sequence",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "unique sequence number to identify services for authorization"
                  },
                  {
                    "name": "codeid",
                    "type": "char",
                    "length": "11",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Approved service code either CPT or Revenue code"
                  },
                  {
                    "name": "medcoverage",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Flag determining if this service gives medical coverage"
                  },
                  {
                    "name": "carelevel",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates carelevel of this service"
                  },
                  {
                    "name": "servcategory",
                    "type": "cattype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Service Category for the authservice line"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status of the entry in authservice"
                  },
                  {
                    "name": "xreasoncode",
                    "type": "typecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "NO LONGER USED - old reasoncode"
                  },
                  {
                    "name": "overridecontract",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates that a contract for cares services is in place that overrides the current contract"
                  },
                  {
                    "name": "totalunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Total units for the authservice entry"
                  },
                  {
                    "name": "usedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Number of units used"
                  },
                  {
                    "name": "actualunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "No of units used - overrides totalunits if loaded"
                  },
                  {
                    "name": "tier",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "tier level for approved service."
                  },
                  {
                    "name": "dosdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date of Service"
                  },
                  {
                    "name": "globalday",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Number of days a member can come back for a service related to this service and still count against initial visit"
                  },
                  {
                    "name": "reqcodeid",
                    "type": "char",
                    "length": "11",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if the authservice code is required for the authservice line"
                  },
                  {
                    "name": "catid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Category ID. Primary key of the svccategory table."
                  },
                  {
                    "name": "subcatid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Service sub category ID. Along with catid make up the primary key of the svcsubcategory table."
                  },
                  {
                    "name": "svcgroupid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Service Group ID. Along with catid and subcatid make up the primary key of the svccatgroup table."
                  },
                  {
                    "name": "reqcatid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Requested category ID - approving service group on authorization."
                  },
                  {
                    "name": "reqsubcatid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Requested sub category ID - approving service group on authorization"
                  },
                  {
                    "name": "reqsvcgrpid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Requested service group ID - approving service group on authorization."
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who created this record"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was created"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who last updated this record"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was last updated"
                  },
                  {
                    "name": "modcode",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Modifier code"
                  },
                  {
                    "name": "modcode2",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2nd Modifier code"
                  },
                  {
                    "name": "toothnumber",
                    "type": "toothtype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Dental - tooth number for service selected."
                  },
                  {
                    "name": "toothsurface",
                    "type": "char",
                    "length": "5",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Tooth surface description that is covered under this service"
                  },
                  {
                    "name": "approvedcodeid",
                    "type": "servicecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Approved code for service line."
                  },
                  {
                    "name": "modcode3",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "3rd Modifier code"
                  },
                  {
                    "name": "modcode4",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "4th Modifier code"
                  },
                  {
                    "name": "modcode5",
                    "type": "modifiertype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "5th Modifier code"
                  },
                  {
                    "name": "globaltemplate",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "X",
                    "fk": "",
                    "description": "Determines if the service comes from an authorization template or referral."
                  },
                  {
                    "name": "negotiatedcontract",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "no definition supplied in QNXT"
                  },
                  {
                    "name": "negotiatedterm",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "no definition supplied in QNXT"
                  },
                  {
                    "name": "negotiatedvalue",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates the negotiated value (in either dollars or percentage) based on the term"
                  },
                  {
                    "name": "ispatientresp",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines patient responsibility on negotiated auth contracts."
                  },
                  {
                    "name": "ndcprodname",
                    "type": "char",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Holds the product name of the NDC group that was selected."
                  },
                  {
                    "name": "appndcgroupname",
                    "type": "char",
                    "length": "50",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Holds the approved NDC group name when the requested NDC group is downcoded/upcoded"
                  },
                  {
                    "name": "interqualid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Inter Qual Identifier"
                  },
                  {
                    "name": "meddirectorid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for a medical director REFERENCES entity(entid)"
                  },
                  {
                    "name": "requestedunits",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Number of requested units from the 278 transaction"
                  },
                  {
                    "name": "svcprocamount",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The dollar amount that is required to perform this procedure"
                  },
                  {
                    "name": "initialreferralid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.4 (135): The one of the initial referral template PK columns used to identify the referral that created this service line"
                  },
                  {
                    "name": "initialreferralseq",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.4 (135): The one of the initial referral template PK columns used to identify the referral that created this service line"
                  },
                  {
                    "name": "detailsourcetype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "2.4 (135): The source type for a system generated referral service line. Values are B: Rebundling and BLANK"
                  },
                  {
                    "name": "initialreferraltemplate",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "2.4 (135): The one of the initial referral template PK columns used to identify the referral that created this service line"
                  },
                  {
                    "name": "dentalareaid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "no definition supplied in QNXT"
                  },
                  {
                    "name": "downcodesurfacecount",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "no definition supplied in QNXT"
                  },
                  {
                    "name": "DeterminationDate",
                    "type": "udtshortdate",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Determination date for each UM service line"
                  },
                  {
                    "name": "H278RecordSequence",
                    "type": "zint",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "HIPAA 278 record sequence"
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
                    "name": "Frequency",
                    "type": "char",
                    "length": "8",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing frequency"
                  },
                  {
                    "name": "EffDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Effective date of this record"
                  },
                  {
                    "name": "TermDate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Term date of this record"
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
                    "description": "Primary key for the enrollcoverage table"
                  },
                  {
                    "name": "enrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Primary key from the enrollkeys table"
                  },
                  {
                    "name": "ratecode",
                    "type": "nametype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Ratecode (group num) assigned for the coverage"
                  },
                  {
                    "name": "coveragecodeid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Primary key from the coveragecode table"
                  },
                  {
                    "name": "effdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Effective date of the record"
                  },
                  {
                    "name": "termdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Termination date of the record"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who created this record"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was created"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who last updated this record"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was last updated"
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
                    "description": "Primary key of the referral table"
                  },
                  {
                    "name": "enrollid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Primary key of the enrollment table"
                  },
                  {
                    "name": "memid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Primary key of the member table"
                  },
                  {
                    "name": "servicecode",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The services that can be performed. Ties to the authcode table to identify the template."
                  },
                  {
                    "name": "COB",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "referto",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The provider that is being referred to"
                  },
                  {
                    "name": "effdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Effective date of record"
                  },
                  {
                    "name": "referfrom",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The provider that request the referral. Typically the primary care provider"
                  },
                  {
                    "name": "emergency",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Emergency Authorization flag"
                  },
                  {
                    "name": "authorizationid",
                    "type": "char",
                    "length": "30",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Authorization identifier for the referral. Typically number given to provider to reference the referral 2.6 (005): Expand to char(30)"
                  },
                  {
                    "name": "lastupdate",
                    "type": "lastupdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was last updated"
                  },
                  {
                    "name": "referraldate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date of referral issue"
                  },
                  {
                    "name": "transferinout",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "1 - Transfer In , 2 - Transfer Out"
                  },
                  {
                    "name": "admitphys",
                    "type": "longname",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Admitting physician"
                  },
                  {
                    "name": "disdiagnosis",
                    "type": "udtdiagcode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "ICD9 diagnosis at the time of discharge"
                  },
                  {
                    "name": "admitdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Admission date for entry in referral"
                  },
                  {
                    "name": "numappt",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "dischargedate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date of discharge"
                  },
                  {
                    "name": "tier1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "tier2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "staytype1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "termdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Termdate of this record"
                  },
                  {
                    "name": "staytype2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "issueinitials",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Auth Issuing - User Initials"
                  },
                  {
                    "name": "actual1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "actual2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "actualstay1",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "actualstay2",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "daysdenied",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "deferreddliab",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "reinsurance",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Third Party Liability"
                  },
                  {
                    "name": "costest",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "perdiemest",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Per diem estimate on the referral"
                  },
                  {
                    "name": "accchg",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "createdate",
                    "type": "createdatetype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date this record was created"
                  },
                  {
                    "name": "createid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who created this record"
                  },
                  {
                    "name": "updateid",
                    "type": "udtuserid",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of the user who last updated this record"
                  },
                  {
                    "name": "diagnosis",
                    "type": "udtdiagcode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "admit",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Admit flag"
                  },
                  {
                    "name": "status",
                    "type": "statustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status of the entry in referral"
                  },
                  {
                    "name": "numremappt",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Not Used"
                  },
                  {
                    "name": "acuity",
                    "type": "typecode",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Urgent, Emergency, and Elective acuity type"
                  },
                  {
                    "name": "attprovid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Attending provider identifier. Foreign key to provider"
                  },
                  {
                    "name": "admtprovid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Admitting provider id"
                  },
                  {
                    "name": "self",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Is the referral a self referral flag"
                  },
                  {
                    "name": "asstsurgeon",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Provider ID of Assistant Surgeon"
                  },
                  {
                    "name": "authstatus",
                    "type": "umstatustype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Status of the authorization"
                  },
                  {
                    "name": "hasassist",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "has Assistant Surgeon"
                  },
                  {
                    "name": "receiptdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Not Yet Used - Authorization Receipt Date"
                  },
                  {
                    "name": "seendate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Not Yet Used - Date Member was in PCP office"
                  },
                  {
                    "name": "userid",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Id of user that entered referral"
                  },
                  {
                    "name": "outofarea",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Flag to indicate if it is an out of area referral"
                  },
                  {
                    "name": "ispredetermination",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Flag to indicate auth was created in predetermination."
                  },
                  {
                    "name": "paytoaffiliationid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Providers pay to affiliation id"
                  },
                  {
                    "name": "hasdocuments",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Flag for auth has documents attached"
                  },
                  {
                    "name": "isautodischargedate",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if the dischargedate field is the result of automatic calculation or was it overriden by a manual entry"
                  },
                  {
                    "name": "referfromnetwork",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Network (provid) being referred from"
                  },
                  {
                    "name": "pendclaims",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates whether the claim(s) will pend when this authorization is used"
                  },
                  {
                    "name": "refertoprovtype",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Primary key from the providertype table"
                  },
                  {
                    "name": "refertopar",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Specifies the par status of the actual referred provider"
                  },
                  {
                    "name": "refertolocation",
                    "type": "char",
                    "length": "2",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Specifies the actual HCFA location for the professional services"
                  },
                  {
                    "name": "isglobal",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines if the authorization is a global authorization."
                  },
                  {
                    "name": "accidentcause",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Cause of accident: (A)uto, (E)mployment, (O)ther, ' '"
                  },
                  {
                    "name": "accidentdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date accident occurred"
                  },
                  {
                    "name": "investigation",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Is an investigation required"
                  },
                  {
                    "name": "lmpdate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "last menstrual period date"
                  },
                  {
                    "name": "estdeldate",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Estimated date of delivery"
                  },
                  {
                    "name": "surgerydatetime",
                    "type": "datetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Surgery date"
                  },
                  {
                    "name": "decrementtype",
                    "type": "char",
                    "length": "3",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Used by adjudication to determin how the units will be decremented from the claim SVC - Servide DOS - Date of Service PRV - Date of Service by Provider"
                  },
                  {
                    "name": "surgerysuggested",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if surgery was suggested for this referral"
                  },
                  {
                    "name": "appeal",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if this referral is an appeal"
                  },
                  {
                    "name": "appealdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Date of the appeal"
                  },
                  {
                    "name": "reviewtype",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines type of review document: A-Authorization, C-Certification or R-Referral"
                  },
                  {
                    "name": "beneprefid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Primary key of the benepreference table"
                  },
                  {
                    "name": "appealoutcome",
                    "type": "shortdesctype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Outcome of the appeal"
                  },
                  {
                    "name": "penaltyapplies",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines if non-compliance penalties apply to claims that use this authorization"
                  },
                  {
                    "name": "retroreview",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines if authorization is retrospective"
                  },
                  {
                    "name": "reqlos",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Requested length of stay"
                  },
                  {
                    "name": "actuallos",
                    "type": "zint",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Actual length of stay"
                  },
                  {
                    "name": "processlogid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Stores the processlogid of the record in the ProcessLogHeader table in the planintegration database that is generated when the 278 transaction is processed by BizTalk"
                  },
                  {
                    "name": "source",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifies the source the authorization was generated from Q = QNXT/QMACS, H = HIPAA2.4 (129)C = Case Manager Module 3.4 SP05 (TZIX PDR 02.B) W = HealthWeb"
                  },
                  {
                    "name": "h278responseneeded",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Determines whether a 278 response is needed for an authorization received via HIPAA (Y/N)"
                  },
                  {
                    "name": "h278responsesent",
                    "type": "datetime",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates the date/time a response was sent for an authorization received via HIPAA"
                  },
                  {
                    "name": "h278processlogdetailid",
                    "type": "ident",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier from the processlogdetail table that this record is tied to"
                  },
                  {
                    "name": "h278responsestatus",
                    "type": "char",
                    "length": "1",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "The current status of the 278 response: (F)inal, (I)ntermediate, (N)one"
                  },
                  {
                    "name": "reqpatinfo",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates if additional information has been requested"
                  },
                  {
                    "name": "h278haschanges",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Indicates whether the requested data (from 278 transaction) and the current data differs (Y/N)"
                  },
                  {
                    "name": "dispositionid",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Foreign key to umdisposition. The disposition of the utilization management document."
                  },
                  {
                    "name": "priority",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifies UM documents that are flagged as High Priority by the user. Manually maintained by the user. Values allowed are H = High or NULL (NOTE: NULL is treated as BLANK)"
                  },
                  {
                    "name": "highlight",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "highlight"
                  },
                  {
                    "name": "nextreviewdate",
                    "type": "smalldatetime",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date UM Document needs to be reviewed."
                  },
                  {
                    "name": "DiagnosisIcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing diagnosisicdversion"
                  },
                  {
                    "name": "DisDiagnosisIcdVersion",
                    "type": "char",
                    "length": "1",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing disdiagnosisicdversion"
                  },
                  {
                    "name": "MergeFromReferralId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for mergefromreferral"
                  },
                  {
                    "name": "IsConsolidated",
                    "type": "yesnotype",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Date related to isconsolidated"
                  },
                  {
                    "name": "ServiceAffilId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for serviceaffil"
                  },
                  {
                    "name": "DefaultContractId",
                    "type": "ident",
                    "length": "",
                    "nullable": "Yes",
                    "pk": "",
                    "fk": "",
                    "description": "Identifier for defaultcontract"
                  },
                  {
                    "name": "TOTALBUDGET",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing totalbudget"
                  },
                  {
                    "name": "USEDBUDGET",
                    "type": "zmoney",
                    "length": "",
                    "nullable": "No",
                    "pk": "",
                    "fk": "",
                    "description": "Value representing usedbudget"
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
                "coverage": "in_memory",
                "reason": "Logical non-executable DTO dataset derived from RxPOS.Schemas.Shared.RequestModels.DUREventDTO",
                "ddlFile": "in_memory_schema\\InMemory.dbo.EVENT.sql",
                "columns": [
                  ["SeverityRankingCode", "int", "", "No"],
                  ["SeverityLevel", "nvarchar", "max", "Yes"],
                  ["ConflictCode", "nvarchar", "max", "Yes"],
                  ["ICN", "nvarchar", "max", "Yes"],
                  ["PrevICN", "nvarchar", "max", "Yes"],
                  ["NdcIndex", "int", "", "No"]
                ].map(([name, type, length, nullable]) => ({
                  name,
                  type,
                  length,
                  nullable,
                  pk: "",
                  fk: "",
                  description: "DTO-derived property from DUREventDTO"
                }))
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
