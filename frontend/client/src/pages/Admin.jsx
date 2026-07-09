import React, { useState } from 'react';
import AdminTabs from '../components/Admin/AdminTabs';
import UserManagement from '../components/Admin/UserManagement';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="main-tab-content active page-padding">
      <h1>Admin Dashboard</h1>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className={`admin-tab-content ${activeTab === 'users' ? 'active' : ''}`}>
        <UserManagement />
      </div>

      <div className={`admin-tab-content ${activeTab === 'schema' ? 'active' : ''}`}>
        {/* Inline content for simplicity or break into SchemaManagement.jsx */}
        <div className="admin-section">
           <h3>Upload New Schema</h3>
           <div className="admin-form">
               <div className="form-group">
                 <label>Schema File:</label>
                 <input type="file" />
                 <button>Upload</button>
               </div>
           </div>
        </div>
      </div>

      <div className={`admin-tab-content ${activeTab === 'terminology' ? 'active' : ''}`}>
        <div className="admin-section">
           <h3>Map Client Terminology</h3>
           <div className="admin-form">
              <div className="form-group">
                <label>Term:</label>
                <input type="text" placeholder="e.g. Total Cost" />
                <button>Save</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
