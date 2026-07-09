import React, { useState, useRef, useEffect } from 'react';
// Note: Paths adjusted for pages/ folder structure
import InputBar from '../components/Chat/InputBar';
import SqlEditor from '../components/Chat/SqlEditor';
import SchemaExplorer from '../components/SchemaExplorer';
import { DEFAULT_TENANT_ID } from '../config/apiConfig';

// Helper function to highlight SQL keywords for readability
const highlightSql = (sql) => {
  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'ON',
    'GROUP BY',
    'ORDER BY',
    'DESC',
    'ASC',
    'AVG',
    'COUNT',
    'SUM',
    'MIN',
    'MAX',
    'LIMIT',
    'AND',
    'OR',
    'AS',
    'INNER',
    'LEFT',
    'RIGHT',
    'OUTER',
  ];
  let regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  return { __html: sql.replace(regex, '<span class="sql-keyword">$1</span>') };
};

// --- CORE CHAT INTERFACE COMPONENT ---
const ChatInterface = () => {
  // ⭐️ State Initialized - FIX FOR ReferenceError ⭐️
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content:
        "Welcome to GW AI Analyst! I'm configured for the MDWise client. Ask a question below, or use the 'Prompt Lib' tab to get started.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const endOfChatRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- ACTIONS ---

  const handleEditToggle = (msgId) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const isEditing = !msg.isEditing;
          return {
            ...msg,
            isEditing,
            // Clear status when entering edit mode
            isValidated: isEditing ? false : msg.isValidated,
          };
        }
        return msg;
      })
    );
  };

  const handleValidate = (msgId, newContent) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, isValidating: true } : msg))
    );

    // Simulate validation delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId) {
            return {
              ...msg,
              content: newContent, // Save edits
              isEditing: false,
              isValidating: false,
              isValidated: true,
            };
          }
          return msg;
        })
      );
    }, 1000);
  };

  const handleRunQuery = (msgId, isPreview) => {
    setIsLoading(true);
    // Simulate fetching results
    setTimeout(() => {
      setIsLoading(false);
      const resultTitle = isPreview
        ? 'Preview Results (10 rows)'
        : 'Full Results (42 rows)';
      const resultMeta = isPreview
        ? 'Query ran with LIMIT 10.'
        : 'Full query executed.';

      // Render HTML string for results with proper table styling
      const resultHtml = `
          <div style="padding: 1rem;">
            <h3 style="font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem;">${resultTitle}</h3>
            <p style="font-size: 0.875rem; color: #757575; margin-bottom: 1rem;">${resultMeta}</p>
            <table class="results-table">
                <thead><tr><th>specialty</th><th>avg_claim_cost</th></tr></thead>
                <tbody>
                    <tr><td>Cardiology</td><td>$1,205.50</td></tr>
                    <tr><td>Oncology</td><td>$980.10</td></tr>
                    <tr><td>Neurology</td><td>$750.00</td></tr>
                    ${!isPreview
          ? '<tr><td>Orthopedics</td><td>$610.20</td></tr><tr><td>Dermatology</td><td>$215.00</td></tr>'
          : '<tr><td colspan="2" style="text-align: center; color: #757575; font-style: italic;">... 7 more rows</td></tr>'
        }
                </tbody>
            </table>
            <div class="results-footer">
               <button class="btn-export-csv">Export to CSV</button>
               <div class="pagination-controls">
                  <label for="rows-per-page">Rows:</label>
                  <select id="rows-per-page"><option>10</option><option>20</option><option>50</option></select>
                  <span>Page 1 of ${isPreview ? '1' : '5'
        }</span>
                  <button>&lt; Prev</button><button>Next &gt;</button>
               </div>
            </div>
          </div>
        `;

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'system', content: resultHtml, isResults: true },
      ]);
    }, 1500);
  };

  // Handle User Sending Message (InputBar callback)
  const handleSend = (text) => {
    const newUserMsg = { id: Date.now(), type: 'user', content: text };
    setMessages((prev) => [...prev, newUserMsg]);

    // Error Test Logic (Simulate failed bot response)
    if (text.toLowerCase().includes('error')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'system',
            isError: true,
            content:
              "I'm sorry, I'm having trouble understanding that request. Could you please rephrase it? I work best with questions about claims, providers, and policy holders.",
          },
        ]);
      }, 1000);
      return; // Stop processing the successful path
    }

    // Successful Path
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const fakeSql = `SELECT
    p.specialty,
    AVG(c.claim_amount) AS avg_claim_cost
FROM
    claims c
JOIN
    providers p ON c.provider_id = p.provider_id
GROUP BY
    p.specialty
ORDER BY
    avg_claim_cost DESC;`;

      const sqlBubbleContent = {
        id: Date.now(),
        type: 'system',
        isSql: true,
        title: 'Generated SQL',
        content: fakeSql,
        isValidated: true,
        isEditing: false,
      };

      const statusMessage = {
        id: Date.now() + 1,
        type: 'system',
        statusMessage: '✅ Query is valid and ready to run.',
      };

      setMessages((prev) => [...prev, sqlBubbleContent, statusMessage]);
    }, 1500);
  };

  return (
    <div id="view-analyst" className="flex flex-col h-full w-full relative bg-white">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-white">
        <div className="flex items-center text-sm">
          <span className="text-gray-500 mr-1">Client:</span>
          <span className="font-semibold text-black">MDWise</span>
          <span className="mx-3 text-gray-300">|</span>
          <span className="text-gray-500 mr-1">Session:</span>
          <span className="font-semibold text-black">
            High-Cost Claims Analysis
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-softblack">
            GW AI Analyst
          </span>
          <span className="text-sm text-gray-500">
            Welcome, Claims Analyst 👋
          </span>
        </div>
      </header>

      {/* Main Area: Sidebar (Schema) + Chat */}
      <div className="flex flex-1 overflow-hidden bg-white">
        {/* Sidebar: Database Schema Explorer */}
        <aside className="w-64 border-r border-gray-200 p-4 overflow-y-auto bg-gray-50">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            Database Schema
          </div>
          <SchemaExplorer tenantId={DEFAULT_TENANT_ID} />
        </aside>

        {/* Main Transcript Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              onEditToggle={handleEditToggle}
              onValidate={handleValidate}
              onRun={handleRunQuery}
            />
          ))}
          {isLoading && (
            <div className="p-4 bg-gray-100 text-gray-500 italic rounded-xl w-fit">
              Generating / Fetching... ⏳
            </div>
          )}
          <div ref={endOfChatRef} />
        </main>
      </div>

      {/* Sticky Footer */}
      <InputBar onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

// --- MESSAGE ITEM SUB-COMPONENT (Renders a single message bubble) ---
const MessageItem = ({ msg, onEditToggle, onValidate, onRun }) => {
  const [editValue, setEditValue] = useState(msg.content);

  const isUser = msg.type === 'user';
  const bubbleBase = 'p-5 rounded-xl w-3/4';

  // Define bubble styling
  const bubbleStyle = isUser
    ? { backgroundColor: '#deeff7', color: '#2B3A44' }
    : { backgroundColor: '#e6e6e6', color: '#2B3A44' };

  const bubblePosition = isUser
    ? 'ml-auto rounded-br-none'
    : 'mr-auto rounded-bl-none';

  // Tailwind conditionals for state colors
  const errorClass = msg.isError
    ? 'bg-error border border-errorText text-errorText'
    : '';

  // The 'status' message is separated by itself
  if (msg.statusMessage) {
    return <div className="chat-bubble status mr-auto">{msg.statusMessage}</div>;
  }

  // Final Bubble Rendering
  return (
    <div
      className={
        errorClass ? `${errorClass} ${bubbleBase}` : `${bubbleBase} ${bubblePosition}`
      }
      style={!errorClass ? bubbleStyle : undefined}
    >
      {/* Header (for SQL) */}
      {msg.title && (
        <div className="flex justify-between items-center pb-2 mb-3">
          <h3
            className="font-semibold text-sm"
            style={{ color: '#757575' }}
          >
            {msg.title}
          </h3>

          {msg.isSql && (
            <div className="flex gap-2">
              {/* Edit/Validate Toggle Button */}
              {msg.isEditing ? (
                <button
                  className="text-xs flex items-center px-3 py-1.5 rounded font-semibold hover:opacity-90"
                  style={{ backgroundColor: '#007958', color: 'white' }}
                  onClick={() => onValidate(msg.id, editValue)}
                >
                  {msg.isValidating ? 'Validating...' : 'Validate'}
                </button>
              ) : (
                <button
                  className="text-xs px-3 py-1.5 rounded font-semibold hover:opacity-90"
                  style={{ backgroundColor: '#757575', color: 'white' }}
                  onClick={() => {
                    setEditValue(msg.content);
                    onEditToggle(msg.id);
                  }}
                >
                  Edit
                </button>
              )}
              {/* Copy Button */}
              <button
                className="text-xs px-3 py-1.5 rounded font-semibold hover:opacity-90"
                style={{ backgroundColor: '#757575', color: 'white' }}
                onClick={() => navigator.clipboard.writeText(msg.content)}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content Rendering */}
      {msg.isSql ? (
        msg.isEditing ? (
          <SqlEditor value={editValue} onChange={setEditValue} />
        ) : (
          <div className="sql-query-content">
            <pre
              className="p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre"
              style={{ backgroundColor: '#2B3A44', color: '#fffde1', margin: 0 }}
              dangerouslySetInnerHTML={highlightSql(msg.content)}
            />
          </div>
        )
      ) : msg.isResults ? (
        <div dangerouslySetInnerHTML={{ __html: msg.content }} />
      ) : msg.isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: msg.content }} />
      ) : (
        <p className="text-sm leading-relaxed">{msg.content}</p>
      )}

      {/* Action Buttons (Preview/Execute) - Only show if SQL and validated and NOT editing */}
      {msg.isSql && msg.isValidated && !msg.isEditing && (
        <div className="mt-4 pt-3 border-t border-gray-400/30 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#757575', color: 'white' }}
              onClick={() => onRun(msg.id, true)}
            >
              Preview (LIMIT 10)
            </button>
            <button
              className="px-4 py-2 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#007cad', color: 'white' }}
              onClick={() => onRun(msg.id, false)}
            >
              Execute All
            </button>
          </div>
          <div className="feedback-buttons flex gap-2">
            <span className="icon-button">👍</span>
            <span className="icon-button">👎</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
