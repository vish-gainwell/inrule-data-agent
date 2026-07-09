/**
 * HITLChatMessage - Displays HITL intervention as a natural chat message with action buttons
 * Instead of a modal popup, this shows the issue conversationally in the chat
 */

import React, { useState } from 'react';
import './HITLChatMessage.css';

export function HITLChatMessage({
    interventionDetails,
    originalQuery,
    onProceed,
    onModify,
    onCancel,
    isLoading,
}) {
    const [showModifyTextarea, setShowModifyTextarea] = useState(false);
    const [modifiedQuery, setModifiedQuery] = useState(originalQuery || '');

    if (!interventionDetails) {
        return null;
    }

    const { type, message, invalid_codes = [], valid_codes = [], suggestions = [] } = interventionDetails;

    const handleProceed = () => {
        onProceed && onProceed();
    };

    const handleModify = () => {
        if (showModifyTextarea && modifiedQuery.trim()) {
            onModify && onModify(modifiedQuery);
            setShowModifyTextarea(false);
            setModifiedQuery(originalQuery);
        } else {
            setShowModifyTextarea(!showModifyTextarea);
        }
    };

    const handleCancel = () => {
        onCancel && onCancel();
    };

    return (
        <div className="hitl-chat-message">
            {/* Agent message with the issue */}
            <div className="agent-message hitl-intervention-message">
                <div className="message-content">
                    <div className="intervention-icon">⚠️</div>
                    <div className="intervention-text">
                        <p className="intervention-title">I found a validation issue:</p>
                        <p className="intervention-description">{message}</p>

                        {/* Show invalid codes */}
                        {invalid_codes && invalid_codes.length > 0 && (
                            <div className="codes-section">
                                <p className="codes-label">❌ Invalid codes:</p>
                                <div className="codes-list">
                                    {invalid_codes.map((code, idx) => (
                                        <span key={idx} className="code-badge invalid">
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show valid codes */}
                        {valid_codes && valid_codes.length > 0 && (
                            <div className="codes-section">
                                <p className="codes-label">✓ Valid codes:</p>
                                <div className="codes-list">
                                    {valid_codes.map((code, idx) => (
                                        <span key={idx} className="code-badge valid">
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show suggestions */}
                        {suggestions && suggestions.length > 0 && (
                            <div className="suggestions-section">
                                <p className="suggestions-label">💡 AI Suggestions:</p>
                                {suggestions.map((suggestion, idx) => (
                                    <div key={idx} className="suggestion-card">
                                        <div className="suggestion-header">
                                            <code className="from-code">{suggestion.original}</code>
                                            <span className="arrow">→</span>
                                            <code className="to-code">{suggestion.corrected}</code>
                                            {suggestion.confidence && (
                                                <span className="confidence">{Math.round(suggestion.confidence * 100)}%</span>
                                            )}
                                        </div>
                                        {suggestion.reason && (
                                            <p className="suggestion-reason">{suggestion.reason}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modify textarea (hidden by default) */}
            {showModifyTextarea && (
                <div className="modify-section">
                    <label>Edit your query:</label>
                    <textarea
                        value={modifiedQuery}
                        onChange={(e) => setModifiedQuery(e.target.value)}
                        placeholder="Edit your query here..."
                        className="modify-textarea"
                    />
                </div>
            )}

            {/* Action buttons */}
            <div className="hitl-action-buttons">
                <button
                    className="hitl-action-btn proceed"
                    onClick={handleProceed}
                    disabled={isLoading}
                    title="Proceed with the original query as-is"
                >
                    <span>✓</span> Proceed with Original
                </button>
                <button
                    className="hitl-action-btn modify"
                    onClick={handleModify}
                    disabled={isLoading}
                    title={showModifyTextarea ? 'Submit modified query' : 'Edit the query'}
                >
                    <span>{showModifyTextarea ? '→' : '✎'}</span> {showModifyTextarea ? 'Submit' : 'Correct'}
                </button>
                <button
                    className="hitl-action-btn cancel"
                    onClick={handleCancel}
                    disabled={isLoading}
                    title="Cancel and start over"
                >
                    <span>✕</span> Cancel
                </button>
            </div>
        </div>
    );
}
