import React, { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS, resolveUserId } from "../../config/apiConfig";
import { apiFetch, buildUrl } from "../../utils/apiUtils";
import { useAuth } from "../../auth/AuthProvider";
import { useClient } from "../../context/ClientContext";

const normalizePromptSections = (payload) => {
  if (!Array.isArray(payload)) return [];

  return payload.map((section, index) => ({
    category: section?.category || `Category ${index + 1}`,
    items: Array.isArray(section?.items)
      ? section.items.map((item, itemIndex) => ({
          id:
            item?.id ??
            item?.prompt_id ??
            item?.promptId ??
            `${index + 1}-${itemIndex + 1}`,
          title: item?.title ?? item?.name ?? "Prompt",
          objective: item?.objective ?? item?.prompt ?? "",
          promptId: item?.prompt_id ?? item?.promptId ?? item?.id,
        }))
      : [],
  }));
};

const splitPromptSections = (sections) => {
  const templateSections = [];
  const savedFavorites = [];

  sections.forEach((section) => {
    if (section.category === "User Prompt") {
      savedFavorites.push(...section.items);
    } else {
      templateSections.push(section);
    }
  });

  return { templateSections, savedFavorites };
};

const PromptItem = ({
  item,
  icon,
  onSelect,
  onTooltipShow,
  onTooltipHide,
  children,
}) => (
  <div
    className="relative flex items-center justify-between gap-2 rounded-lg border border-[#e0e4e8] bg-[#f8f9fa] px-3 py-2 transition-all duration-200 hover:translate-x-1 hover:border-[#007cad] hover:bg-[#e9ecef]"
    onMouseEnter={(event) => onTooltipShow(item, event)}
    onMouseLeave={onTooltipHide}
    onFocus={(event) => onTooltipShow(item, event)}
    onBlur={onTooltipHide}
  >
    <button
      type="button"
      className="min-w-0 flex-1 cursor-pointer text-left"
      onClick={() => onSelect(item.objective)}
    >
      <div className="flex items-center gap-1.5 text-[0.9rem] font-semibold leading-snug text-[#333]">
        <span
          className="shrink-0 text-[0.9rem] leading-none text-[#ffd700]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="truncate">{item.title}</span>
      </div>
    </button>
    {children}
  </div>
);

const InputBar = ({
  onSend,
  onStop,
  disabled,
  disableSubmit,
  isLoading,
  placeholder = "Ask a question...",
}) => {
  const DEMO_SQL_AGENT_ONLY = true;
  const [input, setInput] = useState("");
  const [isIncluded, setIsIncluded] = useState(true);
  const showExclusionsToggle =
    !DEMO_SQL_AGENT_ONLY &&
    (import.meta.env.VITE_SHOW_EXCLUSIONS_TOGGLE ?? "true").toLowerCase() ===
      "true";

  useEffect(() => {
    if (!showExclusionsToggle) {
      setIsIncluded(true);
    }
  }, [showExclusionsToggle]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [promptSections, setPromptSections] = useState([]);
  const [openPromptAccordions, setOpenPromptAccordions] = useState({
    templates: false,
    saved: false,
  });
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState(null);
  const [removingFavoriteIds, setRemovingFavoriteIds] = useState({});
  const [promptTooltip, setPromptTooltip] = useState(null);
  const { account } = useAuth();
  const { client } = useClient();

  const userId = useMemo(() => resolveUserId(account), [account]);
  const { templateSections, savedFavorites } = useMemo(
    () => splitPromptSections(promptSections),
    [promptSections],
  );

  useEffect(() => {
    if (!showFavorites) return;
    if (!client || !userId) return;

    let isMounted = true;
    const fetchPrompts = async () => {
      setPromptsLoading(true);
      setPromptsError(null);

      const url = buildUrl(API_ENDPOINTS.PROMPTS, {
        client_id: client,
        user_id: userId,
      });

      const { success, data, error } = await apiFetch(url, { method: "GET" });

      if (!isMounted) return;

      if (!success) {
        setPromptsError(
          error?.response?.message ||
            error?.message ||
            "Failed to load prompts.",
        );
        setPromptSections([]);
        setPromptsLoading(false);
        return;
      }

      const normalized = normalizePromptSections(data);
      setPromptSections(normalized);
      setOpenPromptAccordions({ templates: false, saved: false });
      setPromptsLoading(false);
    };

    fetchPrompts();

    return () => {
      isMounted = false;
    };
  }, [showFavorites, client, userId]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input, isIncluded);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      !disableSubmit && handleSend();
    }
  };

  const handlePromptSelect = (prompt) => {
    setInput(prompt);
    setShowFavorites(false);
    setPromptTooltip(null);
  };

  const showPromptTooltip = (item, event) => {
    if (!item?.objective) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const hasTopSpace = rect.top > 96;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, 24),
      window.innerWidth - 24,
    );

    setPromptTooltip({
      text: item.objective,
      left,
      top: hasTopSpace ? rect.top : rect.bottom,
      placement: hasTopSpace ? "top" : "bottom",
    });
  };

  const hidePromptTooltip = () => {
    setPromptTooltip(null);
  };

  const togglePromptAccordion = (key) => {
    setOpenPromptAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRemoveFavorite = async (item) => {
    const promptId = item?.promptId ?? item?.id;
    if (!promptId) return;

    setRemovingFavoriteIds((prev) => ({ ...prev, [item.id]: true }));
    setPromptsError(null);

    const url = `${API_ENDPOINTS.FAVORITE_PROMPTS_DELETE}/${encodeURIComponent(promptId)}`;

    const { success, error } = await apiFetch(url, {
      method: "DELETE",
      headers: {
        "X-User-Id": userId || "",
      },
    });

    if (!success) {
      setPromptsError(
        error?.response?.message ||
          error?.message ||
          "Failed to remove favorite.",
      );
      setRemovingFavoriteIds((prev) => ({ ...prev, [item.id]: false }));
      return;
    }

    setPromptSections((prev) =>
      prev
        .map((section) =>
          section.category === "User Prompt"
            ? {
                ...section,
                items: section.items.filter(
                  (candidate) => candidate.id !== item.id,
                ),
              }
            : section,
        )
        .filter(
          (section) =>
            section.category !== "User Prompt" || section.items.length > 0,
        ),
    );
    setRemovingFavoriteIds((prev) => ({ ...prev, [item.id]: false }));
  };

  return (
    <footer className="flex-shrink-0 bg-white border-t border-gray-200 p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-10">
      {/* Ensure this container uses flex and gap */}
      <div className="flex items-start gap-4">
        {/* Button 1: Upload (Shrink-0 is key here) */}
        <button
          className={`${DEMO_SQL_AGENT_ONLY ? "hidden" : "p-3"} bg-systembubble text-softblack rounded-lg hover:bg-gray-300 flex-shrink-0`}
          title="Upload File"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>

        <div
          className={`${DEMO_SQL_AGENT_ONLY ? "hidden" : "relative"} flex-shrink-0`}
        >
          <button
            className="p-3 bg-systembubble text-softblack rounded-lg hover:bg-gray-300 flex-shrink-0 cursor-pointer"
            title="Prompt Library"
            aria-expanded={showFavorites}
            aria-controls="favorites-panel"
            onClick={() => setShowFavorites((prev) => !prev)}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <path d="M8 7h8"></path>
              <path d="M8 11h6"></path>
            </svg>
          </button>

          {showFavorites && (
            <>
              <div
                id="favorites-panel"
                className="absolute bottom-full left-0 z-20 mb-3 max-h-[520px] w-[400px] overflow-hidden rounded-xl border border-[#e0e4e8] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                role="dialog"
                aria-label="Prompt Library"
              >
                <div className="flex items-center justify-between border-b border-[#e0e4e8] bg-[#f8f9fa] p-4">
                  <h4 className="m-0 text-[1.1rem] font-semibold text-[#333]">
                    Prompt Library
                  </h4>
                  <button
                    className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-2xl leading-none text-[#666] hover:bg-[#e9ecef] hover:text-[#333]"
                    onClick={() => setShowFavorites(false)}
                    aria-label="Close prompt library"
                  >
                    &times;
                  </button>
                </div>
                <div className="max-h-[450px] overflow-y-auto p-3">
                  {promptsLoading && (
                    <div className="px-2 py-2 text-xs text-gray-500">
                      Loading prompts...
                    </div>
                  )}
                  {promptsError && (
                    <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {promptsError}
                    </div>
                  )}

                  {!promptsLoading && (
                    <>
                      <div className="mb-3 overflow-hidden rounded-lg border border-[#e0e4e8]">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer select-none items-center justify-between border-0 bg-[#f1f5f9] px-[14px] py-3 text-left font-[inherit] hover:bg-[#e2e8f0]"
                          onClick={() => togglePromptAccordion("templates")}
                          aria-expanded={openPromptAccordions.templates}
                        >
                          <span className="flex items-center gap-2 text-[0.92rem] font-bold text-[#2B3A44]">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            Prompt Templates
                          </span>
                          <span
                            className={`text-xs text-[#5a6978] transition-transform ${openPromptAccordions.templates ? "rotate-90" : ""}`}
                          >
                            &#9656;
                          </span>
                        </button>
                        {openPromptAccordions.templates && (
                          <div className="border-t border-[#e0e4e8] px-[14px] pb-[14px] pt-3">
                            {templateSections.map((section) => (
                              <div
                                key={section.category}
                                className="mb-5 last:mb-0"
                              >
                                <h5 className="mb-3 mt-0 text-[0.95rem] font-semibold uppercase tracking-[0.5px] text-[#007cad]">
                                  {section.category}
                                </h5>
                                <div className="flex flex-col gap-2">
                                  {section.items.map((item) => (
                                    <PromptItem
                                      key={item.id}
                                      item={item}
                                      icon="★"
                                      onSelect={handlePromptSelect}
                                      onTooltipShow={showPromptTooltip}
                                      onTooltipHide={hidePromptTooltip}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                            {templateSections.length === 0 && (
                              <div className="px-2 py-2 text-xs italic text-[#999]">
                                No prompt templates available.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="overflow-hidden rounded-lg border border-[#e0e4e8]">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer select-none items-center justify-between border-0 bg-[#f1f5f9] px-[14px] py-3 text-left font-[inherit] hover:bg-[#e2e8f0]"
                          onClick={() => togglePromptAccordion("saved")}
                          aria-expanded={openPromptAccordions.saved}
                        >
                          <span className="flex items-center gap-2 text-[0.92rem] font-bold text-[#2B3A44]">
                            <svg
                              className="h-4 w-4 text-[#ffd700]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="m12 2.5 2.88 5.84 6.45.94-4.67 4.55 1.1 6.42L12 17.22l-5.77 3.03 1.1-6.42-4.66-4.55 6.44-.94L12 2.5z" />
                            </svg>
                            Saved Favorites
                            <span className="min-w-[18px] rounded-[10px] bg-[#007cad] px-[7px] py-0.5 text-center text-[0.7rem] font-bold text-white">
                              {savedFavorites.length}
                            </span>
                          </span>
                          <span
                            className={`text-xs text-[#5a6978] transition-transform ${openPromptAccordions.saved ? "rotate-90" : ""}`}
                          >
                            &#9656;
                          </span>
                        </button>
                        {openPromptAccordions.saved && (
                          <div className="border-t border-[#e0e4e8] px-[14px] pb-[14px] pt-3">
                            {savedFavorites.length === 0 ? (
                              <div className="px-2 py-2 text-xs italic text-[#999]">
                                No saved favorites yet. Use Mark as Favorite on
                                the Data Agent tab to save queries here.
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {savedFavorites.map((item) => (
                                  <PromptItem
                                    key={item.id}
                                    item={item}
                                    icon="★"
                                    onSelect={handlePromptSelect}
                                    onTooltipShow={showPromptTooltip}
                                    onTooltipHide={hidePromptTooltip}
                                  >
                                    <button
                                      type="button"
                                      className="shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-base leading-none text-[#e53e3e] hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Remove from favorites"
                                      aria-label={`Remove ${item.title} from favorites`}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemoveFavorite(item);
                                      }}
                                      disabled={!!removingFavoriteIds[item.id]}
                                    >
                                      {removingFavoriteIds[item.id]
                                        ? "..."
                                        : "x"}
                                    </button>
                                  </PromptItem>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {promptTooltip && (
                <div
                  className="pointer-events-none fixed z-[9999] max-w-[320px] rounded-md bg-[#333] px-3 py-2 text-left text-xs leading-snug text-white shadow-lg"
                  style={{
                    left: `${promptTooltip.left}px`,
                    top: `${promptTooltip.top}px`,
                    transform:
                      promptTooltip.placement === "top"
                        ? "translate(-50%, calc(-100% - 8px))"
                        : "translate(-50%, 8px)",
                  }}
                  role="tooltip"
                >
                  {promptTooltip.text}
                </div>
              )}
            </>
          )}
        </div>

        {/* TEXTAREA: Use flex-1 to force it to take all remaining space */}
        <textarea
          className="flex-1 min-h-[72px] max-h-[150px] border border-gray-300 rounded-lg p-3 text-base resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          rows="2"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        {/* Toggle Button */}
        {showExclusionsToggle && (
          <button
            className="px-2 py-2 bg-primary text-softblack rounded-lg hover:bg-primary flex-shrink-0 flex items-center gap-2 min-w-[110px]"
            onClick={() => setIsIncluded(!isIncluded)}
            title={isIncluded ? "Apply Exclusions" : "No Exclusions"}
          >
            <div
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${isIncluded ? "bg-green-500" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isIncluded ? "translate-x-6" : "translate-x-0"}`}
              ></div>
            </div>
            <span className="text-xs font-medium text-white">
              {isIncluded ? "Apply Exclusions" : "No Exclusions"}
            </span>
          </button>
        )}

        {/* Button 2: Send / Stop (Shrink-0 is also key here) */}
        {isLoading ? (
          <button
            type="button"
            className="p-3 bg-red-600 text-white rounded-lg font-semibold hover:opacity-90 flex-shrink-0 cursor-pointer"
            onClick={onStop}
            title="Stop generation"
            aria-label="Stop generation"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="6" width="12" height="12" rx="1.5"></rect>
            </svg>
          </button>
        ) : (
          <button
            className="p-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
            onClick={handleSend}
            disabled={disabled || disableSubmit || !input.trim()} // Disable if input is empty
            title="Send Query"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        )}
      </div>
    </footer>
  );
};

export default InputBar;
