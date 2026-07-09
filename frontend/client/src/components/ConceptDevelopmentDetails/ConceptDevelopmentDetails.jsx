import React, {useState} from 'react';
import { RuleDetails } from './RuleDetails';
import { RuleProfiling } from './RuleProfiling';
import { RuleInsights } from './RuleInsights';
import { RuleDocumentation } from './RuleDocumentation';

const ConceptDevelopmentDetails = (props) => {

    const { onRuleBackClick, selectedRuleContext, setToast } = props;
    const [activeTab, setActiveTab] =useState("details");
    const onActiveTabChange = (tab) => {
        setActiveTab(tab)
    }
    return(
        <>
            <div className="policy-tabs" id="policy-tabs" style={{display: "flex"}}>
                <button onClick={()=>onRuleBackClick()} className="btn-back-to-overview" id="btn-back-to-overview">
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{marginRight: 6}}>
                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    Back to Overview
                </button>
                <button
                    onClick={() => onActiveTabChange("details")}
                    className={`policy-tab-btn ${activeTab == "details"? "active" : "" }`}
                    data-tab="rule-details"
                >
                    Rule Details
                </button>
                <button
                    onClick={() => onActiveTabChange("insights")}
                    className={`policy-tab-btn ${activeTab == "insights"? "active" : "" }`}
                    data-tab="query"
                >
                    Rule Insights
                </button>
                <button
                    onClick={() => onActiveTabChange("documentation")}
                    className={`policy-tab-btn ${activeTab == "documentation"? "active" : "" }`}
                    data-tab="rule-documentation"
                >
                    Rule Documentation
                </button>
                {/* <button
                    onClick={() => onActiveTabChange("profiling")}
                    className={`policy-tab-btn ${activeTab == "profiling"? "active" : "" }`}
                    data-tab="rule-validation"
                >
                    Rule Profiling
                </button> */}
            </div>
            <div className="policy-details-section" id="policy-details-section" style={{display: "block"}}>
                { activeTab == "details" && (
                    <RuleDetails selectedRuleContext={selectedRuleContext} setToast={setToast} />
                ) }
                { activeTab == "insights" && (
                    <RuleInsights selectedRuleContext={selectedRuleContext} setToast={setToast} />
                ) }
                { activeTab == "documentation" && (
                    <RuleDocumentation selectedRuleContext={selectedRuleContext} setToast={setToast} />
                ) }
                { activeTab == "profiling" && <RuleProfiling /> }
            </div>
        </>
    )
}

export default ConceptDevelopmentDetails;
