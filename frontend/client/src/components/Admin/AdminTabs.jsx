import React from 'react';

const AdminTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="admin-tabs">
      <button 
        className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} 
        onClick={() => onTabChange('users')}
      >
        User Management
      </button>
      <button 
        className={`admin-tab-btn ${activeTab === 'schema' ? 'active' : ''}`} 
        onClick={() => onTabChange('schema')}
      >
        Schema Management
      </button>
      <button 
        className={`admin-tab-btn ${activeTab === 'terminology' ? 'active' : ''}`} 
        onClick={() => onTabChange('terminology')}
      >
        Terminology
      </button>
    </div>
  );
};

export default AdminTabs;
