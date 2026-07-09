import React, { createContext, useState, useContext } from 'react';

const InputContext = createContext();

// Hook for using the input context
export const useInputContext = () => useContext(InputContext);

export const InputProvider = ({ children }) => {
  // State to temporarily hold the prompt text selected from the library
  const [initialPrompt, setInitialPrompt] = useState(null);

  return (
    <InputContext.Provider value={{ initialPrompt, setInitialPrompt }}>
      {children}
    </InputContext.Provider>
  );
};