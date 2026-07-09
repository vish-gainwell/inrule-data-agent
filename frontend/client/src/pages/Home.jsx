import React from 'react';

const Home = () => {
  return (
    <div className="main-tab-content active page-padding">
      <h1>Welcome to GW AI Analyst</h1>
      <p>This is your intelligent partner for analyzing healthcare claims data. Ask questions using the input bar at the bottom of the page.</p>
      <h3>What is this?</h3>
      <p>Use the <strong>Analyst</strong> tab to have a conversation with your data. Ask questions in plain English, review the generated SQL, and get insights in seconds.</p>
      <h3>How to use it:</h3>
      <ol>
          <li>Go to the <strong>Analyst</strong> tab.</li>
          <li>Use the left-hand menu to see your database <strong>Schema</strong>.</li>
          <li>Ask a question like, "What is the average claim amount by provider specialty?"</li>
          <li>Review the SQL, then hit <strong>Preview</strong> or <strong>Execute All</strong>.</li>
      </ol>
    </div>
  );
};

export default Home;
