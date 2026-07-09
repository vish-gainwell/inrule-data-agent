import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInputContext } from '../context/InputContext'; // 👈 NEW IMPORT

const PromptLibrary = () => {
  const navigate = useNavigate();
  const { setInitialPrompt } = useInputContext(); // 👈 USE CONTEXT

  const promptData = {
      "Cost Analysis": [
          "What is the total claim amount paid last month?",
          "Show the average claim cost per specialty, highest to lowest.",
          "List the top 5 most expensive claims from last quarter."
      ],
      "Provider Metrics": [
          "Who are the top 10 providers by total claim volume?",
          "Show me all claims submitted by 'Community Health Clinic'.",
          "What is the average number of claims per provider?"
      ]
  };

  const handlePromptClick = (promptText) => {
    // 1. Set the global state
    setInitialPrompt(promptText);
    // 2. Navigate to the Analyst view
    navigate('/data-agent'); 
  };

  return (
    <div className="main-tab-content active page-padding">
      <h1>Prompt Library</h1>
      <p>Click any prompt to open it in the Data Agent tab.</p>
      <div id="prompt-page-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
        
        {/* ⭐️ FIX 1: RENDERING THE BLOCKS ⭐️ */}
        {Object.entries(promptData).map(([category, prompts]) => (
          <div key={category} className="prompt-library-card">
            <h3>{category}</h3>
            <ul>
              {prompts.map((text, i) => (
                <li key={i} className="cursor-pointer hover:bg-deeff7 hover:text-primary p-3 rounded" onClick={() => handlePromptClick(text)}>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        ))}
        
      </div>
    </div>
  );
};

export default PromptLibrary;
