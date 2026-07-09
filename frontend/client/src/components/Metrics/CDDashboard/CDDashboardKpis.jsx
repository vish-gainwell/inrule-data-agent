import { useEffect, useMemo, useState } from 'react';
import { formatInteger, formatMoney } from './utils';

const getFeedbackData = (response) => response?.data?.data || response?.data || response || {};

const getFeedbackRequestMeta = (response) => {
  const inner = getFeedbackData(response);
  return {
    requestId: response?.request_id || response?.data?.request_id || '',
    generatedAt: inner.generated_at || response?.generated_at || response?.data?.generated_at || '',
  };
};

const getTopSentimentFromCounts = (counts) => {
  if (!counts || typeof counts !== 'object') return '';

  return Object.entries(counts).reduce(
    (top, [sentiment, count]) => {
      const value = Number(count);
      if (!Number.isFinite(value)) return top;
      return value > top.count ? { sentiment, count: value } : top;
    },
    { sentiment: '', count: -1 }
  ).sentiment;
};

const getTopKeyFromCounts = (counts) => {
  if (!counts || typeof counts !== 'object') return '';

  return Object.entries(counts).reduce(
    (top, [key, count]) => {
      const value = Number(count);
      if (!Number.isFinite(value)) return top;
      return value > top.count ? { key, count: value } : top;
    },
    { key: '', count: -1 }
  ).key;
};

const formatFeedbackMeta = (feedbackWordCloud, feedbackLoading, feedbackError) => {
  if (feedbackLoading) return 'Loading feedback';
  if (feedbackError) return 'Sentiment unavailable';

  const feedbackData = getFeedbackData(feedbackWordCloud);
  const count = Number(feedbackData?.input_feedback_count);
  if (Number.isFinite(count) && count > 0) {
    return `${formatInteger(count)} feedback ${count === 1 ? 'record' : 'records'}`;
  }

  return feedbackData?.empty_state || 'Cumulative';
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const formatCountEntries = (counts) =>
  Object.entries(counts || {})
    .map(([label, count]) => ({ label, count: Number(count) }))
    .filter((item) => Number.isFinite(item.count))
    .sort((a, b) => b.count - a.count);

const getTermClass = (term, index) => {
  const weight = Number(term?.weight);
  if (weight >= 0.75 || index === 0) return 'term-xl';
  if (weight >= 0.45 || index <= 2) return 'term-lg';
  if (weight >= 0.2 || index <= 5) return 'term-md';
  return 'term-sm';
};

const CDDashboardFeedbackWordCloudModal = ({
  feedbackWordCloud,
  feedbackLoading,
  feedbackError,
  onClose,
}) => {
  const feedbackData = getFeedbackData(feedbackWordCloud);
  const meta = getFeedbackRequestMeta(feedbackWordCloud);
  const terms = Array.isArray(feedbackData.terms) ? feedbackData.terms : [];
  const sentimentCounts = formatCountEntries(feedbackData.sentiment_counts);
  const themeCounts = formatCountEntries(feedbackData.theme_counts);
  const topSentiment =
    feedbackData.top_sentiment || getTopSentimentFromCounts(feedbackData.sentiment_counts) || '-';
  const topTheme = feedbackData.top_theme || getTopKeyFromCounts(feedbackData.theme_counts) || '-';
  const topTerms = terms.slice(0, 15);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="cd-feedback-popup-overlay open" onClick={onClose}>
      <div
        className="cd-feedback-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cd-feedback-popup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cd-feedback-popup-header">
          <h4 id="cd-feedback-popup-title">Feedback Word Cloud</h4>
          <button
            className="cd-feedback-popup-close"
            type="button"
            onClick={onClose}
            aria-label="Close Feedback Word Cloud"
          >
            x
          </button>
        </div>

        {feedbackLoading ? (
          <div className="metrics-inline-status">Loading feedback insights...</div>
        ) : feedbackError ? (
          <div className="metrics-inline-status error">{feedbackError}</div>
        ) : (
          <div className="cd-feedback-panel">
            <div className="cd-feedback-meta">
              <span>Generated {formatDateTime(meta.generatedAt)}</span>
              
            </div>

            {terms.length ? (
              <div className="cd-feedback-cloud" aria-label="Frequent feedback terms">
                {topTerms.map((term, index) => (
                  <span
                    className={getTermClass(term, index)}
                    key={`${term.term}-${index}`}
                    title={`${term.count ?? 0} mentions from ${term.feedback_record_count ?? 0} feedback records`}
                  >
                    {term.term}
                  </span>
                ))}
              </div>
            ) : (
              <div className="cd-feedback-empty">{feedbackData.empty_state || 'No feedback terms available.'}</div>
            )}

            <div className="cd-feedback-signal-grid">
              <div className="cd-feedback-signal">
                <span>Top Sentiment</span>
                <strong>{topSentiment}</strong>
              </div>
              <div className="cd-feedback-signal">
                <span>Top Theme</span>
                <strong>{topTheme}</strong>
              </div>
            </div>

            <div className="cd-feedback-count-sections">
              <div className="cd-feedback-count-section">
                <h5>Sentiment Counts</h5>
                {sentimentCounts.length ? (
                  sentimentCounts.map((item) => (
                    <div className="cd-feedback-term-row" key={`sentiment-${item.label}`}>
                      <span>{item.label}</span>
                      <strong>{formatInteger(item.count)}</strong>
                    </div>
                  ))
                ) : (
                  <div className="cd-feedback-muted">No sentiment counts available.</div>
                )}
              </div>
              <div className="cd-feedback-count-section">
                <h5>Theme Counts</h5>
                {themeCounts.length ? (
                  themeCounts.map((item) => (
                    <div className="cd-feedback-term-row" key={`theme-${item.label}`}>
                      <span>{item.label}</span>
                      <strong>{formatInteger(item.count)}</strong>
                    </div>
                  ))
                ) : (
                  <div className="cd-feedback-muted">No theme counts available.</div>
                )}
              </div>
            </div>

            {feedbackData.summary_text ? (
              <p className="cd-feedback-summary">{feedbackData.summary_text}</p>
            ) : null}

            {terms.length ? (
              <div className="cd-feedback-term-list">
                <div className="cd-feedback-term-row cd-feedback-term-heading">
                  <span>Term</span>
                  <strong>count</strong>
                </div>
                {terms.map((term, index) => (
                  <div className="cd-feedback-term-row" key={`${term.term}-row-${index}`}>
                    <span>{term.term}</span>
                    <strong>{formatInteger(term.count)}</strong>
                  </div>
                ))}
              </div>
            ) : null}

          </div>
        )}
      </div>
    </div>
  );
};

const CDDashboardKpis = ({
  kpis,
  feedbackWordCloud,
  feedbackLoading = false,
  feedbackError = '',
}) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const feedbackData = useMemo(() => getFeedbackData(feedbackWordCloud), [feedbackWordCloud]);
  const topSentiment =
    feedbackData?.top_sentiment ||
    getTopSentimentFromCounts(feedbackData?.sentiment_counts);
  const sentimentValue = feedbackLoading
    ? 'Loading...'
    : feedbackError
      ? 'Unavailable'
      : topSentiment || 'No feedback';
  const openFeedbackModal = () => setIsFeedbackModalOpen(true);
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false);
  const handleFeedbackCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFeedbackModal();
    }
  };

  return (
    <>
      <div className="cd-kpi-grid">
        <div className="cd-kpi-card"><div className="label">Clients</div><div className="value">{formatInteger(kpis.clients_count)}</div></div>
        <div className="cd-kpi-card"><div className="label">Policies</div><div className="value">{formatInteger(kpis.policies_count)}</div></div>
        <div className="cd-kpi-card"><div className="label">Rules</div><div className="value">{formatInteger(kpis.rules_count)}</div></div>
        <div className="cd-kpi-card"><div className="label">Opportunity</div><div className="value">{formatMoney(kpis.opportunity_size)}</div></div>
        <div
          className="cd-kpi-card cd-kpi-card-clickable"
          role="button"
          tabIndex={0}
          onClick={openFeedbackModal}
          onKeyDown={handleFeedbackCardKeyDown}
          title={feedbackData?.summary_text || feedbackError || 'View Feedback Word Cloud'}
        >
          <div className="label">
            Top Feedback Sentiment
            <button
              className="cd-kpi-info-icon"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openFeedbackModal();
              }}
              title="View Feedback Word Cloud"
              aria-label="View Feedback Word Cloud"
            >
              i
            </button>
          </div>
          <div className="value text-value">{sentimentValue}</div>
          <div className="meta">{formatFeedbackMeta(feedbackWordCloud, feedbackLoading, feedbackError)}</div>
        </div>
      </div>

      {isFeedbackModalOpen ? (
        <CDDashboardFeedbackWordCloudModal
          feedbackWordCloud={feedbackWordCloud}
          feedbackLoading={feedbackLoading}
          feedbackError={feedbackError}
          onClose={closeFeedbackModal}
        />
      ) : null}
    </>
  );
};

export default CDDashboardKpis;
