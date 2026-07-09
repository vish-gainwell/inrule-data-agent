import React from 'react';

const UserManagement = () => {
  return (
    <div className="admin-section">
      <h3>Join User to Client</h3>
      <div className="admin-form">
        <div className="form-group">
          <label htmlFor="admin-user">User:</label>
          <select id="admin-user">
            <option>analyst@company.com</option>
            <option>manager@company.com</option>
          </select>
          <label htmlFor="admin-client">Client:</label>
          <select id="admin-client">
            <option>MDWise</option>
            <option>McLaren</option>
          </select>
          <button>Assign User</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
