// src/components/Layout/TopTabs.jsx
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/gainwell_logo.png';
import { useAuth } from '../../auth/AuthProvider.jsx';
import '../../css/TopTabs.css';

const TopTabs = () => {
  const navigate = useNavigate();
  const { account, signOut } = useAuth() || {};
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpMenuRef = useRef(null);
  const feedbackMenuRef = useRef(null);

  const handleSignOut = async (e) => {
    e?.preventDefault?.();
    try {
      if (window.gwAnalystFinalizeSession) {
        await window.gwAnalystFinalizeSession();
      }
    } catch (err) {
      console.warn('[TopTabs] finalize on sign-out failed', err);
    }

    try {
      if (signOut) {
        await signOut();
      }
    } catch (err) {
      console.warn('[TopTabs] signOut error', err);
    } finally {
      navigate('/login');
    }
  };

  const baseClass =
    'px-6 py-4 font-semibold text-sm border-b-2 transition-colors duration-200';
  const activeClass = 'text-primary border-primary';
  const inactiveClass =
    'text-secondary border-transparent hover:text-gray-600';

  const feedbackLinks = {
    feedbackSpreadsheetHref:
      'https://mygainwell.sharepoint.com/:x:/r/teams/PaymentAnalytics/Shared Documents/General/Testing/UAT Defect Logging PI Analytics.xlsx?d=w2574c32c930f49308ce73dcb1ed09620&csf=1&web=1&e=AjQrg8',
    feedbackSpreadsheetLabel: 'UAT Defect Logging PI Analytics.xlsx',
    mailboxHref: 'mailto:gwaianalyst@gainwelltechnologies.com',
    mailboxLabel: 'gwaianalyst@gainwelltechnologies.com',
    teamsChatHref:
      'https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fchat%2F19%3Affca9bfd629244db853ccfc223cce3d1%40thread.v2%2Fconversations%3Fcontext%3D%257B%2522contextType%2522%253A%2522chat%2522%257D&type=chat&deeplinkId=6bfd16cf-3b1b-4017-973f-49ca24d0ba0e',
    teamsChatLabel: 'PI - AI assistant - UAT | Group Chat | Microsoft Teams',
  };
  const userManualHref = '/Concept_Development_User_Manual_vf.html';

  const openUserManual = (e) => {
    e?.preventDefault?.();
    window.open(userManualHref, '_blank', 'noopener,noreferrer');
  };

  const toggleFeedbackPanel = (e) => {
    e?.preventDefault?.();
    setIsFeedbackOpen((prev) => !prev);
    setIsHelpOpen(false);
  };

  const toggleHelpPanel = (e) => {
    e?.preventDefault?.();
    setIsHelpOpen((prev) => !prev);
    setIsFeedbackOpen(false);
  };

  const closeFeedbackPanel = (e) => {
    e?.preventDefault?.();
    setIsFeedbackOpen(false);
  };

  const closeHelpPanel = (e) => {
    e?.preventDefault?.();
    setIsHelpOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isHelpOpen &&
        helpMenuRef.current &&
        !helpMenuRef.current.contains(event.target)
      ) {
        setIsHelpOpen(false);
      }

      if (
        isFeedbackOpen &&
        feedbackMenuRef.current &&
        !feedbackMenuRef.current.contains(event.target)
      ) {
        setIsFeedbackOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHelpOpen, isFeedbackOpen]);

  const helpMenu = (
    <div
      ref={helpMenuRef}
      className="help-wrapper"
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        className="help-btn"
        onClick={toggleHelpPanel}
        aria-label="Help"
        title="Help"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Help
      </button>
      <div className={`help-panel${isHelpOpen ? ' active' : ''}`} id="help-panel">
        <div className="help-panel-header">
          <h4>Help &amp; Documentation</h4>
          <button
            type="button"
            className="help-panel-close"
            onClick={closeHelpPanel}
          >
            &times;
          </button>
        </div>
        <div className="help-panel-body">
          <p
            style={{
              color: '#2B3A44',
              marginTop: 0,
              marginBottom: 16,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            User Manuals &amp; Guides:
          </p>
          <div className="help-docs-grid">
            <a href="#" target="_blank" className="help-doc-link" rel="noreferrer">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <div className="doc-info">
                <div className="doc-title">User Guide</div>
                <div className="doc-desc">Complete guide to using PI Analyst</div>
              </div>
            </a>
            <a href="#" target="_blank" className="help-doc-link" rel="noreferrer">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <div className="doc-info">
                <div className="doc-title">Quick Start Guide</div>
                <div className="doc-desc">Get started with basic features</div>
              </div>
            </a>
            <a href="#" target="_blank" className="help-doc-link" rel="noreferrer">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <div className="doc-info">
                <div className="doc-title">Video Tutorials</div>
                <div className="doc-desc">Watch step-by-step tutorials</div>
              </div>
            </a>
            <a href="#" target="_blank" className="help-doc-link" rel="noreferrer">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <div className="doc-info">
                <div className="doc-title">FAQs</div>
                <div className="doc-desc">Frequently asked questions</div>
              </div>
            </a>
          </div>
        </div>
        <div className="help-panel-footer">
          <button type="button" className="btn-secondary" onClick={closeHelpPanel}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const feedbackMenu = (
    <div
      ref={feedbackMenuRef}
      className="feedback-wrapper"
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        className="feedback-btn"
        onClick={toggleFeedbackPanel}
        aria-label="Feedback"
        title="Feedback"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="12" y1="6" x2="12" y2="12" />
        </svg>
        Feedback
      </button>
      <div
        className={`feedback-panel${isFeedbackOpen ? ' active' : ''}`}
        id="feedback-panel"
      >
        <div className="feedback-panel-header">
          <h4>Submit Feedback</h4>
          <button
            type="button"
            className="feedback-panel-close"
            onClick={closeFeedbackPanel}
          >
            &times;
          </button>
        </div>
        <div className="feedback-panel-body" id="feedback-form-content">
          <p
            style={{
              color: '#2B3A44',
              marginTop: 0,
              marginBottom: 16,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            How to provide feedback:
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: '#5a6978',
              fontSize: '0.85rem',
              lineHeight: 1.8,
            }}
          >
            <li style={{ marginBottom: 12 }}>
              <strong style={{ color: '#2B3A44' }}>
                Log in the UAT spreadsheet
              </strong>
              <br />
              <a
                href={feedbackLinks.feedbackSpreadsheetHref}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#1a7f64', textDecoration: 'none' }}
              >
                {feedbackLinks.feedbackSpreadsheetLabel}
              </a>
            </li>
            <li style={{ marginBottom: 12 }}>
              <strong style={{ color: '#2B3A44' }}>
                Reach out to the shared mailbox
              </strong>
              <br />
              <a
                href={feedbackLinks.mailboxHref}
                style={{ color: '#1a7f64', textDecoration: 'none' }}
              >
                {feedbackLinks.mailboxLabel}
              </a>
            </li>
            {/* <li style={{ marginBottom: 0 }}>
              <strong style={{ color: '#2B3A44' }}>
                Ping in the UAT teams channel
              </strong>
              <br />
              <a
                href={feedbackLinks.teamsChatHref}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#1a7f64', textDecoration: 'none' }}
              >
                {feedbackLinks.teamsChatLabel}
              </a>
            </li> */}
          </ul>
        </div>
        <div className="feedback-panel-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={closeFeedbackPanel}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const userManualButton = (
    <button
      type="button"
      className="feedback-btn"
      onClick={openUserManual}
      aria-label="User Manual"
      title="User Manual"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 4a2 2 0 0 1 2-2h6a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H4a2 2 0 0 1-2-2z" />
        <path d="M22 4a2 2 0 0 0-2-2h-6a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h6a2 2 0 0 0 2-2z" />
      </svg>
      User Manual
    </button>
  );

  return (
    <div className="flex items-center bg-gray-50 border-b border-gray-300 shrink-0 px-2">
      {/* Left tabs */}
      {/* <NavLink
        to="/home"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        Home
      </NavLink> */}
      <NavLink
        to="/data-agent"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        Data Agent
      </NavLink>
      {false && (
        <>
          <NavLink
            to="/concept-development"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Concept Development
          </NavLink>
          <NavLink
            to="/master-query"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Master Query
          </NavLink>
          <NavLink
            to="/metrics"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Metrics
          </NavLink>
        </>
      )}
      {/* <NavLink
        to="/prompts"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        Prompt Lib
      </NavLink>
      <NavLink
        to="/admin"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        Admin
      </NavLink> */}

      {/* Right side: user + auth + logo */}
      <div className="ml-auto flex items-center gap-4 pr-4">
        <span className="hidden md:inline text-xs text-secondary">
          {account
            ? `Welcome, ${account.name || account.username || 'Analyst'} 👋`
            : 'Not signed in'}
        </span>

        {userManualButton}
        {/* {helpMenu} */}
        {feedbackMenu}

        {account ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="feedback-btn"
          >
            Sign out
          </button>
        ) : (
          <NavLink
            to="/login"
            className="text-xs px-3 py-1 rounded border border-primary text-primary bg-white hover:bg-primary hover:text-white transition-colors"
          >
            Sign in
          </NavLink>
        )}

        <div className="py-2 pl-2">
          <img src={logo} alt="Gainwell logo" className="h-8 w-auto" />
        </div>
      </div>
    </div>
  );
};

export default TopTabs;
