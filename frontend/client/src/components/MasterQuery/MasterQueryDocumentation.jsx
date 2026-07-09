import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import {
  getMasterQueryNoteUrl,
  getMasterQueryNotesUrl,
  resolveUserId,
} from '../../config/apiConfig';

const MAX_NOTE_LENGTH = 2000;
const URL_REGEX_SOURCE = "(?:https?:\\/\\/|www\\.)[^\\s<]+";
const EMPTY_VALUE = '-';

const MESSAGES = {
  LOAD_FAILED: 'Failed to load query notes.',
  SAVE_FAILED: 'Failed to save note.',
  SAVE_SUCCESS: 'Note saved successfully.',
  UPDATE_FAILED: 'Failed to update note.',
  UPDATE_SUCCESS: 'Note updated successfully.',
  DELETE_FAILED: 'Failed to delete note.',
  DELETE_SUCCESS: 'Note deleted successfully.',
  NOTE_REQUIRED: 'Please enter a note before saving.',
  NOTE_TOO_LONG: `Note cannot exceed ${MAX_NOTE_LENGTH} characters.`,
  QUERY_ID_MISSING: 'Query ID is missing. Cannot save note.',
  NOTE_ID_MISSING: 'Note ID is missing.',
};

const NOTE_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const parseApiTimestamp = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  if (!raw) return null;

  const hasTimezone = /([zZ]|[+\-]\d{2}:\d{2})$/.test(raw);
  const normalized = hasTimezone ? raw : `${raw}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatNoteTimestamp = (value) => {
  const date = parseApiTimestamp(value);
  return date ? NOTE_DATE_FORMATTER.format(date) : EMPTY_VALUE;
};

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const payload = await response.json();
    if (Array.isArray(payload?.detail)) {
      return (
        payload.detail
          .map((item) => item?.msg)
          .filter(Boolean)
          .join(', ') || fallbackMessage
      );
    }
    return payload?.detail || payload?.message || JSON.stringify(payload) || fallbackMessage;
  } catch (jsonErr) {
    try {
      return (await response.text()) || fallbackMessage;
    } catch (textErr) {
      return fallbackMessage;
    }
  }
};

const linkifyText = (text) => {
  const value = String(text || '');
  const urlRegex = new RegExp(`(${URL_REGEX_SOURCE})`, 'gi');
  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(value)) !== null) {
    const rawUrl = match[0];
    const start = match.index;
    if (start > lastIndex) {
      result.push(value.slice(lastIndex, start));
    }

    const cleanUrl = rawUrl.replace(/[),.;!?]+$/g, '');
    const trailing = rawUrl.slice(cleanUrl.length);
    const href = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;

    result.push(
      <a
        key={`url-${start}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mq-note-link"
      >
        {cleanUrl}
      </a>
    );

    if (trailing) result.push(trailing);
    lastIndex = start + rawUrl.length;
  }

  if (lastIndex < value.length) {
    result.push(value.slice(lastIndex));
  }

  return result;
};

const renderNoteText = (noteText) =>
  String(noteText || '')
    .split('\n')
    .map((line, index, lines) => (
      <React.Fragment key={`line-${index}`}>
        {linkifyText(line)}
        {index < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    ));

const getNoteUser = (note) =>
  String(note?.user_name || note?.user_id || EMPTY_VALUE).trim() || EMPTY_VALUE;

const MasterQueryDocumentation = ({ queryId, client, setToast }) => {
  const { account } = useAuth();
  const userId = resolveUserId(account);
  const userName = String(account?.name || account?.username || userId || 'Unknown User').trim();

  const [notes, setNotes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [updatingNoteId, setUpdatingNoteId] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const showToast = useCallback(
    (message, severity) => {
      setToast?.({ open: true, message, severity });
    },
    [setToast]
  );

  const resetAddNote = useCallback(() => {
    setIsAddNoteOpen(false);
    setNoteText('');
  }, []);

  const resetEditNote = useCallback(() => {
    setEditingNoteId(null);
    setEditNoteText('');
  }, []);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => {
        const bDate = parseApiTimestamp(b?.notes_timestamp);
        const aDate = parseApiTimestamp(a?.notes_timestamp);
        return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
      }),
    [notes]
  );

  const loadNotes = useCallback(async () => {
    if (!queryId || !client) {
      setNotes([]);
      setTotalCount(0);
      setErrorDetail('');
      return;
    }

    setIsLoading(true);
    setErrorDetail('');
    try {
      const response = await fetch(getMasterQueryNotesUrl(queryId, client), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const message = await getErrorMessage(response, MESSAGES.LOAD_FAILED);
        setErrorDetail(message);
        setNotes([]);
        setTotalCount(0);
        return;
      }

      const payload = await response.json();
      const apiNotes = Array.isArray(payload?.notes) ? payload.notes : [];
      setNotes(apiNotes);
      setTotalCount(Number(payload?.total_count) || apiNotes.length);
    } catch (err) {
      setErrorDetail(err?.message || MESSAGES.LOAD_FAILED);
      setNotes([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [client, queryId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    resetAddNote();
    resetEditNote();
  }, [queryId, resetAddNote, resetEditNote]);

  const openAddNoteForm = () => {
    setErrorDetail('');
    resetEditNote();
    setIsAddNoteOpen(true);
  };

  const saveNote = async () => {
    const trimmedNote = noteText.trim();
    if (!trimmedNote) {
      showToast(MESSAGES.NOTE_REQUIRED, 'warning');
      return;
    }
    if (trimmedNote.length > MAX_NOTE_LENGTH) {
      showToast(MESSAGES.NOTE_TOO_LONG, 'warning');
      return;
    }
    if (!queryId) {
      showToast(MESSAGES.QUERY_ID_MISSING, 'error');
      return;
    }

    setIsSaving(true);
    setErrorDetail('');
    try {
      const response = await fetch(getMasterQueryNotesUrl(queryId, client), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          notes: trimmedNote,
          user_name: userName,
        }),
      });

      if (!response.ok) {
        showToast(await getErrorMessage(response, MESSAGES.SAVE_FAILED), 'error');
        return;
      }

      const payload = await response.json();
      if (payload?.note && typeof payload.note === 'object') {
        setNotes((current) => [payload.note, ...current]);
        setTotalCount((current) => current + 1);
      } else {
        await loadNotes();
      }
      resetAddNote();
      showToast(payload?.message || MESSAGES.SAVE_SUCCESS, 'success');
    } catch (err) {
      showToast(err?.message || MESSAGES.SAVE_FAILED, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditNote = (note) => {
    const noteId = note?.note_id;
    if (noteId !== 0 && !noteId) {
      showToast(MESSAGES.NOTE_ID_MISSING, 'error');
      return;
    }
    setErrorDetail('');
    resetAddNote();
    setEditingNoteId(noteId);
    setEditNoteText(String(note?.notes || ''));
  };

  const updateNote = async (note) => {
    const noteId = note?.note_id;
    const trimmedNote = editNoteText.trim();
    if (noteId !== 0 && !noteId) {
      showToast(MESSAGES.NOTE_ID_MISSING, 'error');
      return;
    }
    if (!trimmedNote) {
      showToast(MESSAGES.NOTE_REQUIRED, 'warning');
      return;
    }
    if (trimmedNote.length > MAX_NOTE_LENGTH) {
      showToast(MESSAGES.NOTE_TOO_LONG, 'warning');
      return;
    }

    setUpdatingNoteId(noteId);
    setErrorDetail('');
    try {
      const response = await fetch(getMasterQueryNoteUrl(queryId, noteId, client), {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ notes: trimmedNote }),
      });

      if (!response.ok) {
        showToast(await getErrorMessage(response, MESSAGES.UPDATE_FAILED), 'error');
        return;
      }

      const payload = await response.json();
      const updatedNote =
        payload?.note && typeof payload.note === 'object'
          ? payload.note
          : { ...note, notes: trimmedNote };
      setNotes((current) =>
        current.map((item) => (item?.note_id === noteId ? updatedNote : item))
      );
      resetEditNote();
      showToast(payload?.message || MESSAGES.UPDATE_SUCCESS, 'success');
    } catch (err) {
      showToast(err?.message || MESSAGES.UPDATE_FAILED, 'error');
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const deleteNote = async (note) => {
    const noteId = note?.note_id;
    if (noteId !== 0 && !noteId) {
      showToast(MESSAGES.NOTE_ID_MISSING, 'error');
      return;
    }

    setDeletingNoteId(noteId);
    setErrorDetail('');
    try {
      const response = await fetch(getMasterQueryNoteUrl(queryId, noteId, client), {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        showToast(await getErrorMessage(response, MESSAGES.DELETE_FAILED), 'error');
        return;
      }

      const payload = await response.json();
      setNotes((current) => current.filter((item) => item?.note_id !== noteId));
      setTotalCount((current) => Math.max(0, current - 1));
      showToast(payload?.message || MESSAGES.DELETE_SUCCESS, 'success');
    } catch (err) {
      showToast(err?.message || MESSAGES.DELETE_FAILED, 'error');
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div className="mq-policy-tab-content active" id="mq-tab-documentation">
      <div className="mq-doc-card">
        <div className="mq-doc-header">
          <h3>Query Documentation &amp; Notes</h3>
          <button
            className="mq-btn-add-note"
            type="button"
            onClick={openAddNoteForm}
            disabled={isSaving}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Note
          </button>
        </div>

        {isAddNoteOpen ? (
          <div className="mq-add-note-form" id="mq-add-note-form">
            <div className="mq-note-form-inner">
              <label htmlFor="mq-note-text-input">Note:</label>
              <textarea
                id="mq-note-text-input"
                rows="4"
                placeholder="Enter your note here..."
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                maxLength={MAX_NOTE_LENGTH}
              />
              <div className="mq-note-char-helper">
                <span>Max {MAX_NOTE_LENGTH} characters</span>
                <span>
                  {noteText.length}/{MAX_NOTE_LENGTH}
                </span>
              </div>
              <div className="mq-note-form-actions">
                <button
                  className="mq-btn-save-note"
                  type="button"
                  onClick={saveNote}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Note'}
                </button>
                <button
                  className="mq-btn-cancel-note"
                  type="button"
                  onClick={resetAddNote}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="loading-indicator" role="status" aria-live="polite">
            Loading notes...
          </div>
        ) : null}
        {errorDetail ? (
          <div className="error-detail" role="alert">
            {errorDetail}
          </div>
        ) : null}

        <div className="mq-notes-table-wrapper">
          {sortedNotes.length > 0 ? (
            <table className="mq-notes-table" id="mq-notes-table">
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Timestamp</th>
                  <th style={{ width: '180px' }}>User</th>
                  <th className="mq-notes-column">Notes</th>
                  <th style={{ width: '170px' }}>Action</th>
                </tr>
              </thead>
              <tbody id="mq-notes-tbody">
                {sortedNotes.map((note, index) => {
                  const noteId = note?.note_id;
                  const noteKey = noteId ?? `${note?.notes_timestamp || 'note'}-${index}`;
                  const isEditingThisNote = editingNoteId === noteId;
                  const isUpdatingThisNote = updatingNoteId === noteId;
                  const isDeletingThisNote = deletingNoteId === noteId;
                  const isBusy = isSaving || isUpdatingThisNote || isDeletingThisNote;
                  const isMissingNoteId = noteId !== 0 && !noteId;

                  return (
                    <tr key={noteKey}>
                      <td className="mq-note-timestamp">
                        {formatNoteTimestamp(note?.notes_timestamp)}
                      </td>
                      <td className="mq-note-user">{getNoteUser(note)}</td>
                      <td className="mq-note-text">
                        {isEditingThisNote ? (
                          <div className="mq-note-edit-wrapper">
                            <textarea
                              className="mq-note-edit-textarea"
                              value={editNoteText}
                              onChange={(event) => setEditNoteText(event.target.value)}
                              maxLength={MAX_NOTE_LENGTH}
                              rows="3"
                              aria-label="Edit note"
                            />
                            <div className="mq-note-char-helper mq-note-edit-helper">
                              <span>Max {MAX_NOTE_LENGTH} characters</span>
                              <span>
                                {editNoteText.length}/{MAX_NOTE_LENGTH}
                              </span>
                            </div>
                          </div>
                        ) : (
                          renderNoteText(note?.notes || EMPTY_VALUE)
                        )}
                      </td>
                      <td className="mq-note-actions">
                        {isEditingThisNote ? (
                          <div className="mq-note-action-buttons">
                            <button
                              className="mq-btn-save-note-row"
                              type="button"
                              onClick={() => updateNote(note)}
                              disabled={isUpdatingThisNote}
                            >
                              {isUpdatingThisNote ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              className="mq-btn-cancel-note-row"
                              type="button"
                              onClick={resetEditNote}
                              disabled={isUpdatingThisNote}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mq-note-action-buttons">
                            <button
                              className="mq-btn-edit-note"
                              type="button"
                              onClick={() => startEditNote(note)}
                              disabled={isBusy || isMissingNoteId}
                            >
                              Edit
                            </button>
                            <button
                              className="mq-btn-delete-note"
                              type="button"
                              onClick={() => deleteNote(note)}
                              disabled={isBusy || isMissingNoteId}
                            >
                              {isDeletingThisNote ? 'Deleting...' : 'Delete'}
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
            <div className="mq-notes-empty-state" id="mq-notes-empty-state">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <p>
                No notes yet. Click <strong>Add Note</strong> to create the first entry.
              </p>
            </div>
          ) : null}
        </div>

        {totalCount > 0 ? <div className="mq-note-count-label">Total Notes: {totalCount}</div> : null}
      </div>
    </div>
  );
};

export default MasterQueryDocumentation;
