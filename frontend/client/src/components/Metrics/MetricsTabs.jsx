const MetricsTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'queries', label: 'Analysis' },
    { id: 'health', label: 'System Health' },
    { id: 'cd-dashboard', label: 'CD Admin Dashboard' },
  ];

  return (
    <div className="metrics-sub-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`metrics-sub-tab-btn${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default MetricsTabs;
