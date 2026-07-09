import React from 'react';

const MasterQueryFilters = ({
  filters,
  states,
  assignees,
  statuses,
  onChange,
  onApply,
  onClear,
}) => (
  <section className="mq-policy-filters-container" aria-label="Master query filters">
    <div className="mq-policy-filters-row">
      <FilterSelect
        id="mq-state-filter"
        label="State:"
        value={filters.state}
        emptyLabel="All States"
        options={states}
        onChange={(value) => onChange('state', value)}
      />
      <FilterSelect
        id="mq-assigned-filter"
        label="Assigned To:"
        value={filters.assignedTo}
        emptyLabel="All"
        options={assignees}
        onChange={(value) => onChange('assignedTo', value)}
      />
      <FilterSelect
        id="mq-status-filter"
        label="Status:"
        value={filters.status}
        emptyLabel="All"
        options={statuses}
        onChange={(value) => onChange('status', value)}
      />
      <div className="mq-filter-actions">
        <button type="button" className="mq-btn-filter-clear" onClick={onClear}>
          Clear
        </button>
        <button type="button" className="mq-btn-filter-apply" onClick={onApply}>
          Apply
        </button>
      </div>
    </div>
  </section>
);

const FilterSelect = ({ id, label, value, emptyLabel, options, onChange }) => (
  <div className="mq-filter-group">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{emptyLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default MasterQueryFilters;
