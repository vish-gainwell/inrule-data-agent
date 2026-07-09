import React from 'react';

const SqlEditor = ({ value, onChange }) => {
  return (
    <textarea 
      className="sql-edit-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck="false"
    />
  );
};

export default SqlEditor;
