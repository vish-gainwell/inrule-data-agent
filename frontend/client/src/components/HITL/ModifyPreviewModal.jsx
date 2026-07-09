import React, { useState } from 'react';
import { generatePreviewExplanation } from '../../utils/queryRephrase';
import './ModifyPreviewModal.css';

/**
 * ModifyPreviewModal - Shows user the rephrased query before execution
 * 
 * Displays:
 * 1. Original query (from chat)
 * 2. User's correction/additional context
 * 3. Combined/rephrased query (what system will use)
 * 4. Confirmation buttons
 */
export function ModifyPreviewModal({
  isOpen,
  originalQuery,
  userCorrection,
  rephrasedQuery,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const [userConfirmed, setUserConfirmed] = useState(false);

  // Reset confirmation when modal closes or new query arrives
  React.useEffect(() => {
    if (!isOpen) {
      setUserConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setUserConfirmed(false);
    onConfirm();
  };

  const handleCancel = () => {
    setUserConfirmed(false);
    onCancel();
  };

  return (
    <div className="modify-preview-overlay">
      <div className="modify-preview-modal">
        {/* Header */}
        <div className="preview-header">
          <div>
            <h2>Verify Modified Query</h2>
            <p className="preview-subtitle">
              Review how your correction will be applied
            </p>
          </div>
          <button
            className="preview-close-button"
            onClick={handleCancel}
            title="Close"
            disabled={isLoading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="preview-body">
          {/* Original Query */}
          <div className="preview-section">
            <div className="section-label">
              <span className="label-text">Original Query</span>
              <span className="label-badge original">from chat</span>
            </div>
            <div className="query-box original-box">
              <code>{originalQuery}</code>
            </div>
          </div>

          {/* User Correction */}
          {userCorrection && (
            <>
              <div className="plus-icon">+</div>

              <div className="preview-section">
                <div className="section-label">
                  <span className="label-text">Your Correction</span>
                  <span className="label-badge correction">user input</span>
                </div>
                <div className="query-box correction-box">
                  <code>{userCorrection}</code>
                </div>
              </div>
            </>
          )}

          {/* Arrow */}
          <div className="arrow-icon">↓</div>

          {/* Rephrased Query */}
          <div className="preview-section highlight">
            <div className="section-label">
              <span className="label-text">Query to Execute</span>
              <span className="label-badge execute">
                {isLoading ? 'processing...' : 'ready'}
              </span>
            </div>
            <div className="query-box rephrased-box">
              <code>{rephrasedQuery}</code>
            </div>
            <p className="query-hint">
              {generatePreviewExplanation(originalQuery, userCorrection, rephrasedQuery)}
            </p>
            {rephrasedQuery !== originalQuery && (
              <div className="change-indicator">
                <span className="change-icon">✓</span>
                <span className="change-text">Changes applied to your query</span>
              </div>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <div className="confirmation-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={userConfirmed}
                onChange={(e) => setUserConfirmed(e.target.checked)}
                disabled={isLoading}
              />
              <span>
                I've reviewed the query and want to proceed with SQL generation
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="preview-footer">
          <button
            className="preview-button cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Edit Query
          </button>
          <button
            className="preview-button confirm"
            onClick={handleConfirm}
            disabled={!userConfirmed || isLoading}
          >
            {isLoading ? 'Processing...' : 'Generate SQL'}
          </button>
        </div>
      </div>
    </div>
  );
}
