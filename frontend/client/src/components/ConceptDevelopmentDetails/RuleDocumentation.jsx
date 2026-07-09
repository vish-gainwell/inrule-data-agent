import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useClient } from "../../context/ClientContext";
import {
  CONCEPT_DEVELOPMENT_API_ENDPOINTS,
  resolveUserId,
} from "../../config/apiConfig";

const MAX_NOTE_LENGTH = 2000;
const URL_REGEX_SOURCE = "(?:https?:\\/\\/|www\\.)[^\\s<]+";
const EMPTY_VALUE = "-";
const DEFAULT_MESSAGES = {
  LOAD_FAILED: "Failed to load notes.",
  SAVE_FAILED: "Failed to save note.",
  SAVE_SUCCESS: "Note saved successfully.",
  UPDATE_FAILED: "Failed to update note.",
  UPDATE_SUCCESS: "Note updated successfully.",
  DELETE_FAILED: "Failed to delete note.",
  DELETE_SUCCESS: "Note deleted successfully.",
  NOTE_REQUIRED: "Please enter a note before saving.",
  NOTE_TOO_LONG: `Note cannot exceed ${MAX_NOTE_LENGTH} characters.`,
  RULE_ID_MISSING: "Rule ID is missing. Cannot save note.",
  NOTE_ID_MISSING: "Note ID is missing.",
};

const NOTE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const parseApiTimestamp = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  if (!raw) return null;

  // If backend sends no timezone (e.g. 2026-04-13T11:41:20.775), treat it as UTC.
  const hasTimezone = /([zZ]|[+\-]\d{2}:\d{2})$/.test(raw);
  const normalized = hasTimezone ? raw : `${raw}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatNoteTimestamp = (value) => {
  const date = parseApiTimestamp(value);
  if (!date) return EMPTY_VALUE;
  return NOTE_DATE_FORMATTER.format(date);
};

const formatUserEmail = (value) => {
  const email = String(value || "").trim();
  if (!email) return EMPTY_VALUE;
  return email.replace(/@gainwelltechnologies\.com$/i, "");
};

const parseErrorMessage = async (response, fallbackMessage) => {
  try {
    const payload = await response.json();
    if (Array.isArray(payload?.detail)) {
      const detailMessage = payload.detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(", ");
      return detailMessage || fallbackMessage;
    }

    return (
      payload?.detail ||
      payload?.message ||
      (typeof payload === "string" ? payload : JSON.stringify(payload)) ||
      fallbackMessage
    );
  } catch (err) {
    try {
      const text = await response.text();
      return text || fallbackMessage;
    } catch (textErr) {
      return fallbackMessage;
    }
  }
};

const linkifyText = (text) => {
  const value = String(text || "");
  const urlRegex = new RegExp(`(${URL_REGEX_SOURCE})`, "gi");
  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(value)) !== null) {
    const rawUrl = match[0];
    const start = match.index;
    if (start > lastIndex) {
      result.push(value.slice(lastIndex, start));
    }

    const cleanUrl = rawUrl.replace(/[),.;!?]+$/g, "");
    const trailing = rawUrl.slice(cleanUrl.length);
    const href = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;

    result.push(
      <a
        key={`url-${start}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="note-link"
      >
        {cleanUrl}
      </a>
    );

    if (trailing) {
      result.push(trailing);
    }
    lastIndex = start + rawUrl.length;
  }

  if (lastIndex < value.length) {
    result.push(value.slice(lastIndex));
  }

  return result;
};

const renderNoteRichText = (noteText) => {
  const lines = String(noteText || "").split("\n");
  return lines.map((line, index) => (
    <React.Fragment key={`line-${index}`}>
      {linkifyText(line)}
      {index < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
};

export const RuleDocumentation = ({ selectedRuleContext, setToast }) => {
  const { account } = useAuth();
  const { client } = useClient();

  const ruleId = String(selectedRuleContext?.rule?.rule_id || "").trim();
  const runId = String(selectedRuleContext?.rule?.run_id || "").trim();

  const userId = resolveUserId(account);
  const userEmail = String(account?.username || userId || "").trim();
  const userName = String(account?.name || userEmail || "Unknown User").trim();

  const [notes, setNotes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [updatingNoteId, setUpdatingNoteId] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const showToast = useCallback(
    (message, severity) => {
      setToast?.({
        open: true,
        message,
        severity,
      });
    },
    [setToast]
  );

  const resetNoteEditor = useCallback(() => {
    setIsAddNoteOpen(false);
    setNoteText("");
  }, []);

  const resetEditNote = useCallback(() => {
    setEditingNoteId(null);
    setEditNoteText("");
  }, []);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => {
          const bDate = parseApiTimestamp(b?.notes_timestamp);
          const aDate = parseApiTimestamp(a?.notes_timestamp);
          return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
        }
      ),
    [notes]
  );

  const handleLoadFailure = useCallback((message) => {
    setErrorDetail(message);
    setNotes([]);
    setTotalCount(0);
  }, []);

  const loadNotes = useCallback(async () => {
    if (!client || !ruleId || !userId) {
      handleLoadFailure("");
      return;
    }

    setIsLoading(true);
    setErrorDetail("");
    try {
      const params = new URLSearchParams({ rule_id: ruleId });
      const response = await fetch(
        `${CONCEPT_DEVELOPMENT_API_ENDPOINTS.NOTES_GET_ALL}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "user-id": userId,
          },
        }
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response, DEFAULT_MESSAGES.LOAD_FAILED);
        handleLoadFailure(message);
        return;
      }

      const payload = await response.json();
      const apiNotes = Array.isArray(payload?.notes) ? payload.notes : [];
      setNotes(apiNotes);
      setTotalCount(Number(payload?.total_count) || apiNotes.length);
    } catch (err) {
      handleLoadFailure(err?.message || DEFAULT_MESSAGES.LOAD_FAILED);
    } finally {
      setIsLoading(false);
    }
  }, [client, ruleId, userId, handleLoadFailure]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    resetNoteEditor();
    resetEditNote();
  }, [ruleId, resetNoteEditor, resetEditNote]);

  const openAddNoteForm = () => {
    setErrorDetail("");
    resetEditNote();
    setIsAddNoteOpen(true);
  };

  const cancelAddNote = () => {
    resetNoteEditor();
  };

  const saveNote = async () => {
    const trimmedNote = noteText.trim();
    if (!trimmedNote) {
      showToast(DEFAULT_MESSAGES.NOTE_REQUIRED, "warning");
      return;
    }
    if (trimmedNote.length > MAX_NOTE_LENGTH) {
      showToast(DEFAULT_MESSAGES.NOTE_TOO_LONG, "warning");
      return;
    }

    if (!ruleId) {
      showToast(DEFAULT_MESSAGES.RULE_ID_MISSING, "error");
      return;
    }

    setIsSaving(true);
    setErrorDetail("");

    try {
      const payload = {
        rule_id: ruleId,
        run_id: runId,
        notes: trimmedNote,
        user_email: userEmail,
        user_name: userName,
        notes_timestamp: new Date().toISOString(),
      };

      const response = await fetch(CONCEPT_DEVELOPMENT_API_ENDPOINTS.NOTES_ADD, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, DEFAULT_MESSAGES.SAVE_FAILED);
        showToast(message, "error");
        return;
      }

      const data = await response.json();
      const createdNote = data?.note;
      if (createdNote && typeof createdNote === "object") {
        setNotes((prev) => [createdNote, ...prev]);
        setTotalCount((prev) => prev + 1);
      } else {
        await loadNotes();
      }

      resetNoteEditor();
      showToast(data?.message || DEFAULT_MESSAGES.SAVE_SUCCESS, "success");
    } catch (err) {
      showToast(err?.message || DEFAULT_MESSAGES.SAVE_FAILED, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditNote = (note) => {
    if (note?.is_feedback_note === true) {
      return;
    }

    const noteId = note?.note_id;
    if (!noteId && noteId !== 0) {
      showToast(DEFAULT_MESSAGES.NOTE_ID_MISSING, "error");
      return;
    }

    setErrorDetail("");
    resetNoteEditor();
    setEditingNoteId(noteId);
    setEditNoteText(String(note?.notes || ""));
  };

  const updateNote = async (note) => {
    const noteId = note?.note_id;
    const trimmedNote = editNoteText.trim();
    if (!noteId && noteId !== 0) {
      showToast(DEFAULT_MESSAGES.NOTE_ID_MISSING, "error");
      return;
    }
    if (!trimmedNote) {
      showToast(DEFAULT_MESSAGES.NOTE_REQUIRED, "warning");
      return;
    }
    if (trimmedNote.length > MAX_NOTE_LENGTH) {
      showToast(DEFAULT_MESSAGES.NOTE_TOO_LONG, "warning");
      return;
    }

    if (!ruleId) {
      showToast(DEFAULT_MESSAGES.RULE_ID_MISSING, "error");
      return;
    }

    setUpdatingNoteId(noteId);
    setErrorDetail("");

    try {
      const payload = {
        rule_id: ruleId,
        notes: trimmedNote,
        notes_timestamp: note?.notes_timestamp || new Date().toISOString(),
      };

      const response = await fetch(
        `${CONCEPT_DEVELOPMENT_API_ENDPOINTS.NOTES_UPDATE}/${encodeURIComponent(noteId)}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "user-id": userId,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response, DEFAULT_MESSAGES.UPDATE_FAILED);
        showToast(message, "error");
        return;
      }

      const data = await response.json();
      const updatedNote = data?.note && typeof data.note === "object"
        ? data.note
        : {
            ...note,
            notes: trimmedNote,
          };

      setNotes((prev) =>
        prev.map((item) => (item?.note_id === noteId ? updatedNote : item))
      );
      resetEditNote();
      showToast(data?.message || DEFAULT_MESSAGES.UPDATE_SUCCESS, "success");
    } catch (err) {
      showToast(err?.message || DEFAULT_MESSAGES.UPDATE_FAILED, "error");
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const deleteNote = async (note) => {
    if (note?.is_feedback_note === true) {
      return;
    }

    const noteId = note?.note_id;
    if (!noteId && noteId !== 0) {
      showToast(DEFAULT_MESSAGES.NOTE_ID_MISSING, "error");
      return;
    }

    if (!ruleId) {
      showToast(DEFAULT_MESSAGES.RULE_ID_MISSING, "error");
      return;
    }

    setDeletingNoteId(noteId);
    setErrorDetail("");

    try {
      const params = new URLSearchParams({ rule_id: ruleId });
      const response = await fetch(
        `${CONCEPT_DEVELOPMENT_API_ENDPOINTS.NOTES_DELETE}/${encodeURIComponent(noteId)}?${params.toString()}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "user-id": userId,
          },
        }
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response, DEFAULT_MESSAGES.DELETE_FAILED);
        showToast(message, "error");
        return;
      }

      const data = await response.json();
      setNotes((prev) => prev.filter((note) => note?.note_id !== noteId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      showToast(data?.message || DEFAULT_MESSAGES.DELETE_SUCCESS, "success");
    } catch (err) {
      showToast(err?.message || DEFAULT_MESSAGES.DELETE_FAILED, "error");
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div className="policy-tab-content active" id="policy-tab-rule-documentation">
      <div className="rule-doc-card">
        <div className="rule-doc-header">
          <h3>Rule Documentation &amp; Notes</h3>
          <button
            className="btn-add-note"
            type="button"
            onClick={openAddNoteForm}
            disabled={isSaving}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Note
          </button>
        </div>

        {isAddNoteOpen ? (
          <div className="add-note-form" id="add-note-form">
            <div className="note-form-inner">
              <label htmlFor="note-text-input">Note:</label>
              <textarea
                id="note-text-input"
                rows="4"
                placeholder="Enter your note here..."
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                maxLength={MAX_NOTE_LENGTH}
              ></textarea>
              <div className="note-char-helper">
                <span>Max {MAX_NOTE_LENGTH} characters</span>
                <span>
                  {noteText.length}/{MAX_NOTE_LENGTH}
                </span>
              </div>
              <div className="note-form-actions">
                <button
                  className="btn-save-note"
                  type="button"
                  onClick={saveNote}
                  disabled={isSaving}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {isSaving ? "Saving..." : "Save Note"}
                </button>
                <button
                  className="btn-cancel-note"
                  type="button"
                  onClick={cancelAddNote}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isLoading ? <div className="loading-indicator">Loading notes...</div> : null}
        {errorDetail ? <div className="error-detail">{errorDetail}</div> : null}

        <div className="notes-table-wrapper">
          {sortedNotes.length > 0 ? (
            <table className="notes-table" id="notes-table">
              <thead>
                <tr>
                  <th style={{ width: "180px" }}>Timestamp</th>
                  <th style={{ width: "180px" }}>User</th>
                  <th className="notes-column">Notes</th>
                  <th style={{ width: "180px" }}>Action</th>
                </tr>
              </thead>
              <tbody id="notes-tbody">
                {sortedNotes.map((note, index) => {
                  const noteKey = note?.note_id ?? `${note?.notes_timestamp || "note"}-${index}`;
                  const noteId = note?.note_id;
                  const noteUserEmail = String(note?.user_email || "").trim();
                  const noteUserDisplay = formatUserEmail(noteUserEmail);
                  const isEditingThisNote = editingNoteId === noteId;
                  const isUpdatingThisNote = updatingNoteId === noteId;
                  const isDeletingThisNote = deletingNoteId === noteId;
                  const isBusy = isSaving || isUpdatingThisNote || isDeletingThisNote;
                  const isFeedbackNote = note?.is_feedback_note === true;
                  const isDeleteDisabled =
                    isFeedbackNote || isBusy || (noteId !== 0 && !noteId);
                  const isEditDisabled =
                    isFeedbackNote || isBusy || (noteId !== 0 && !noteId);
                  const noteActionDisabledTitle = isFeedbackNote
                    ? "Feedback notes cannot be edited or deleted"
                    : "Note ID missing";
                  return (
                    <tr key={noteKey}>
                      <td className="note-timestamp">{formatNoteTimestamp(note?.notes_timestamp)}</td>
                      <td className="note-user" title={noteUserEmail || noteUserDisplay}>
                        {noteUserDisplay}
                      </td>
                      <td className="note-text">
                        {isEditingThisNote ? (
                          <div className="note-edit-wrapper">
                            <textarea
                              className="note-edit-textarea"
                              value={editNoteText}
                              onChange={(event) => setEditNoteText(event.target.value)}
                              maxLength={MAX_NOTE_LENGTH}
                              rows="3"
                              aria-label="Edit note"
                            ></textarea>
                            <div className="note-char-helper note-edit-helper">
                              <span>Max {MAX_NOTE_LENGTH} characters</span>
                              <span>
                                {editNoteText.length}/{MAX_NOTE_LENGTH}
                              </span>
                            </div>
                          </div>
                        ) : (
                          renderNoteRichText(note?.notes || EMPTY_VALUE)
                        )}
                      </td>
                      <td className="note-actions">
                        {isEditingThisNote ? (
                          <div className="note-action-buttons">
                            <button
                              className="btn-save-note-row"
                              type="button"
                              onClick={() => updateNote(note)}
                              disabled={isUpdatingThisNote}
                            >
                              {isUpdatingThisNote ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="btn-cancel-note-row"
                              type="button"
                              onClick={resetEditNote}
                              disabled={isUpdatingThisNote}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="note-action-buttons">
                            <button
                              className="btn-edit-note"
                              type="button"
                              onClick={() => startEditNote(note)}
                              disabled={isEditDisabled}
                              title={
                                isEditDisabled && !isBusy
                                  ? noteActionDisabledTitle
                                  : "Edit note"
                              }
                              aria-label="Edit note"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                              </svg>
                              Edit
                            </button>
                            <button
                              className="btn-delete-note"
                              type="button"
                              onClick={() => deleteNote(note)}
                              disabled={isDeleteDisabled}
                              title={
                                isDeleteDisabled && !isBusy
                                  ? noteActionDisabledTitle
                                  : "Delete note"
                              }
                              aria-label="Delete note"
                            >
                              {isDeletingThisNote ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6l-1 14H6L5 6"></path>
                                    <path d="M10 11v6"></path>
                                    <path d="M14 11v6"></path>
                                    <path d="M9 6V4h6v2"></path>
                                  </svg>
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : !isLoading ? (
            <div className="notes-empty-state" id="notes-empty-state">
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="#b3b3b3"
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <p>
                No notes yet. Click <strong>Add Note</strong> to create the first entry.
              </p>
            </div>
          ) : null}
        </div>
        {totalCount > 0 ? (
          <div className="note-count-label">Total Notes: {totalCount}</div>
        ) : null}
      </div>
    </div>
  );
};
