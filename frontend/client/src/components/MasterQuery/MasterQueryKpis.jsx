import React from 'react';

const MasterQueryKpis = ({ queryCount }) => (
  <section className="mq-kpi-cards" aria-label="Master query metrics">
    <div className="mq-kpi-card">
      <div className="mq-kpi-content">
        <span className="mq-kpi-value">{queryCount}</span>
        <span className="mq-kpi-label">Number of Queries</span>
      </div>
    </div>
  </section>
);

export default MasterQueryKpis;
