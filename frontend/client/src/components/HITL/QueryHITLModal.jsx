/**
 * QueryHITLModal - Modal component for displaying HITL interventions
 * 
 * Displays:
 * - Intervention message
 * - Invalid codes (if CPT validation)
 * - Suggested corrections
 * - Action buttons (Proceed, Modify, Cancel, etc.)
 */

import React, { useState } from 'react';
import { ModifyPreviewModal } from './ModifyPreviewModal';
import { rephraseQuery, generatePreviewExplanation } from '../../utils/queryRephrase';
import { API_ENDPOINTS } from '../../config/apiConfig';
import './QueryHITLModal.css';

export function QueryHITLModal({
    isOpen,
    interventionType,
    interventionDetails,
    originalQuery,
    isLoading,
    error,
    sessionId,
    tenantId,
    userId,
    onProceed,
    onModify,
    onCancel,
    onOriginal,
}) {
    const [modifiedQuery, setModifiedQuery] = useState('');
    const [showTextarea, setShowTextarea] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [pendingModification, setPendingModification] = useState(null);
    const [rephraseLoading, setRephraseLoading] = useState(false);

    // Reset state when new intervention comes in
    React.useEffect(() => {
        if (isOpen && interventionDetails) {
            setModifiedQuery('');
            setShowTextarea(false);
            setShowPreview(false);
            setPendingModification(null);
        }
    }, [isOpen, interventionDetails?.message]); // Reset when new message arrives

    if (!isOpen || !interventionDetails) {
        return null;
    }

    const details = interventionDetails;
    const actions = details.actions || [];

    const handleActionClick = (action) => {
        const actionValue = action.value.toLowerCase();

        switch (actionValue) {
            case 'proceed':
                onProceed && onProceed();
                break;
            case 'modify':
                if (modifiedQuery.trim()) {
                    // Use LLM to intelligently rephrase the query with user's correction
                    rephraseQueryWithLLM(
                        originalQuery,
                        modifiedQuery,
                        details.invalid_codes || []
                    );
                } else {
                    alert('Please enter a modified query');
                }
                break;
            case 'cancel':
                onCancel && onCancel();
                break;
            case 'original':
                onOriginal && onOriginal();
                break;
            default:
                console.warn(`Unknown action: ${actionValue}`);
        }
    };

    const rephraseQueryWithLLM = async (original, correction, invalidCodes) => {
        try {
            setRephraseLoading(true);
            console.log('[QueryHITLModal] Calling LLM to rephrase query:', {
                originalQuery: original,
                userCorrection: correction,
                invalidCodes: invalidCodes,
            });

            const response = await fetch(API_ENDPOINTS.REPHRASE_QUERY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId || '',
                    'X-Tenant-Id': tenantId || 'MDWise',
                    'X-User-Id': userId || '',
                },
                body: JSON.stringify({
                    original_query: original,
                    user_correction: correction,
                    invalid_codes: invalidCodes,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[QueryHITLModal] LLM rephrase failed:', response.statusText, errorText);
                // Fallback: use simple rephrasing if LLM fails
                const simpleRephrased = rephraseQuery(original, correction, invalidCodes);
                showPreviewModal(correction, simpleRephrased);
                return;
            }

            const result = await response.json();
            console.log('[QueryHITLModal] LLM rephrase response:', result);

            // Show preview with LLM-generated rephrased query
            showPreviewModal(correction, result.rephrased_query);
        } catch (err) {
            console.error('[QueryHITLModal] Error calling rephrase API:', err);
            // Fallback to simple rephrasing
            const simpleRephrased = rephraseQuery(original, correction, invalidCodes);
            showPreviewModal(correction, simpleRephrased);
        } finally {
            setRephraseLoading(false);
        }
    };

    const showPreviewModal = (correction, rephrasedQuery) => {
        // Store the modification and show preview modal
        setPendingModification({
            userCorrection: correction,
            rephrasedQuery: rephrasedQuery,
        });
        setShowPreview(true);
    };

    const handleConfirmModification = () => {
        if (pendingModification) {
            onModify && onModify(pendingModification.rephrasedQuery);
            setModifiedQuery('');
            setShowTextarea(false);
            setShowPreview(false);
            setPendingModification(null);
        }
    };

    const handleCancelPreview = () => {
        setShowPreview(false);
        setPendingModification(null);
        // Keep the textarea open with user's text
    };

    return (
        <div className="hitl-modal-overlay">
            <div className="hitl-modal">
                <div className="hitl-modal-header">
                    <div>
                        <h2>⚠️ Query Validation Required</h2>
                        <span className="hitl-intervention-type">
                            {details.type || 'validation'}
                        </span>
                    </div>
                    <button
                        className="hitl-close-button"
                        onClick={onCancel}
                        title="Close"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <div className="hitl-modal-body">
                    {/* Message */}
                    <div className="hitl-message">
                        <p>{details.message}</p>
                    </div>

                    {/* Invalid Codes */}
                    {details.invalid_codes && details.invalid_codes.length > 0 && (
                        <div className="hitl-section">
                            <h3>❌ Invalid Codes Detected:</h3>
                            <div className="code-list">
                                {details.invalid_codes.map((code, idx) => (
                                    <span key={idx} className="code-badge invalid">
                                        {code}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Valid Codes */}
                    {details.valid_codes && details.valid_codes.length > 0 && (
                        <div className="hitl-section">
                            <h3>✅ Valid Codes:</h3>
                            <div className="code-list">
                                {details.valid_codes.map((code, idx) => (
                                    <span key={idx} className="code-badge valid">
                                        {code}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {details.suggestions && details.suggestions.length > 0 && (
                        <div className="hitl-section">
                            <h3>💡 AI Suggestions:</h3>
                            <div className="suggestions-list">
                                {details.suggestions.map((suggestion, idx) => (
                                    <div key={idx} className="suggestion-item">
                                        <div className="suggestion-original">
                                            <code>{suggestion.original}</code>
                                            <span className="arrow">→</span>
                                            <code>{suggestion.corrected}</code>
                                        </div>
                                        <p>{suggestion.reason}</p>
                                        {suggestion.confidence && (
                                            <span className="confidence">
                                                Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Modify Textarea */}
                    {showTextarea && (
                        <div className="hitl-section">
                            <h3>Modify Your Query:</h3>
                            <textarea
                                className="query-textarea"
                                value={modifiedQuery}
                                onChange={(e) => setModifiedQuery(e.target.value)}
                                placeholder={`Original query: ${originalQuery}`}
                                rows={4}
                            />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="hitl-modal-footer">
                    {actions.map((action, idx) => {
                        const actionValue = action.value.toLowerCase();

                        if (actionValue === 'modify') {
                            return (
                                <div key={idx} className="modify-button-group">
                                    {!showTextarea ? (
                                        <button
                                            className={`hitl-button ${action.style || 'primary'}`}
                                            onClick={() => setShowTextarea(true)}
                                            disabled={isLoading}
                                        >
                                            {action.label}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="hitl-button primary"
                                                onClick={() => handleActionClick(action)}
                                                disabled={isLoading || !modifiedQuery.trim()}
                                            >
                                                Update Query
                                            </button>
                                            <button
                                                className="hitl-button secondary"
                                                onClick={() => {
                                                    setShowTextarea(false);
                                                    setModifiedQuery('');
                                                }}
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <button
                                key={idx}
                                className={`hitl-button ${action.style || 'primary'}`}
                                onClick={() => handleActionClick(action)}
                                disabled={isLoading}
                            >
                                {isLoading && actionValue !== 'cancel' ? 'Processing...' : action.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Modify Preview Modal */}
            {pendingModification && (
                <ModifyPreviewModal
                    isOpen={showPreview}
                    originalQuery={originalQuery}
                    userCorrection={pendingModification.userCorrection}
                    rephrasedQuery={pendingModification.rephrasedQuery}
                    onConfirm={handleConfirmModification}
                    onCancel={handleCancelPreview}
                    isLoading={isLoading || rephraseLoading}
                />
            )}
        </div>
    );
}
