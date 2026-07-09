import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';

/**
 * useQueryAnalyzer - Custom hook for managing query analysis and HITL flow
 * 
 * This hook handles:
 * 1. Sending queries to /api/query_analyzer for guardrail checks
 * 2. Managing HITL state (visible, intervention details)
 * 3. Handling user actions (proceed, modify, cancel, original)
 * 4. Re-validation after user actions
 */
export function useQueryAnalyzer() {
    const [hitlState, setHitlState] = useState({
        isVisible: false,
        interventionType: null,
        interventionDetails: null,
        originalQuery: '',
        sessionId: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Analyze query before SQL generation
     * Calls /query_analyzer endpoint (proxied to localhost:4757)
     */
    const analyzeQuery = useCallback(async (query: any, sessionId: any, userId: any = null, tenantId: any = null) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('[useQueryAnalyzer] analyzeQuery called with:', { query, sessionId, userId, tenantId });
            
            const headers: any = {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId,
            };
            if (userId) {
                headers['X-User-Id'] = userId;
            }
            if (tenantId) {
                headers['X-Tenant-Id'] = tenantId;
            }

            const response = await fetch(API_ENDPOINTS.QUERY_ANALYZER, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    query,
                    session_id: sessionId,
                    user_id: userId,
                    tenant_id: tenantId,
                }),
            });

            const result = await response.json();
            console.log('[useQueryAnalyzer] /query_analyzer response:', { status: response.status, result });

            if (!response.ok) {
                setError(result.error || 'Query analysis failed');
                return { success: false, error: result.error };
            }

            // Check if human intervention is required
            if (result.human_intervention_required) {
                console.log('[useQueryAnalyzer] HITL triggered! Setting state:', result);
                setHitlState({
                    isVisible: true,
                    interventionType: result.intervention_type,
                    interventionDetails: result.intervention_details,
                    originalQuery: query,
                    sessionId,
                });

                return {
                    success: true,
                    human_intervention_required: true,
                    intervention_type: result.intervention_type,
                };
            }

            // Query passed all guardrails
            console.log('[useQueryAnalyzer] No HITL needed - guardrails passed');
            return {
                success: true,
                human_intervention_required: false,
                validated_query: result.validated_query || query,
                generated_sql: result.generated_sql,
                validated_sql: result.validated_sql,
                llm_confidence: result.llm_confidence,
                llm_explanation: result.llm_explanation,
                chat_title: result.chat_title,
            };
        } catch (err) {
            const errorMsg = (err as any).message || 'Network error during query analysis';
            console.error('[useQueryAnalyzer] Error:', errorMsg, err);
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Handle user's HITL action (proceed, modify, cancel, original)
     * Calls /api/hitl/respond endpoint
     */
    const respondToHitl = useCallback(
        async (action: string, modifiedQuery: any = null, sessionId: any = null, userId: any = null, tenantId: any = null) => {
            setIsLoading(true);
            setError(null);

            const actualSessionId = sessionId || hitlState.sessionId;

            try {
                const headers: any = {
                    'Content-Type': 'application/json',
                    'X-Session-Id': actualSessionId,
                };
                if (userId) {
                    headers['X-User-Id'] = userId;
                }
                if (tenantId) {
                    headers['X-Tenant-Id'] = tenantId;
                }

                const response = await fetch(API_ENDPOINTS.HITL_RESPOND, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        session_id: actualSessionId,
                        action,
                        original_query: hitlState.originalQuery,
                        modified_query: modifiedQuery,
                        user_id: userId,
                        tenant_id: tenantId,
                    }),
                });

                // Handle empty or non-JSON responses
                let result;
                const responseText = await response.text();
                
                if (!responseText.trim()) {
                    // Empty response - treat as success for actions like cancel
                    result = { success: true };
                } else {
                    try {
                        result = JSON.parse(responseText);
                    } catch (jsonError) {
                        console.error('[useQueryAnalyzer] Invalid JSON response:', responseText);
                        setError(`Invalid JSON response: ${responseText}`);
                        return { success: false, error: 'Invalid JSON response from server' };
                    }
                }

                if (!response.ok) {
                    const errorMessage = result?.error || `HTTP ${response.status}: ${responseText}`;
                    setError(errorMessage);
                    return { success: false, error: errorMessage };
                }

                // Check if new HITL is triggered
                if (result.human_intervention_required && result.next_action === 'show_hitl') {
                    // Update HITL state with new intervention details
                    setHitlState((prev) => ({
                        ...prev,
                        interventionDetails: result.intervention_details,
                    }));

                    return {
                        success: true,
                        human_intervention_required: true,
                        next_action: 'show_hitl',
                        intervention_details: result.intervention_details,
                    };
                }

                // User action resolved - close HITL modal
                if (result.next_action === 'proceed_to_sql' || result.next_action === 'restart') {
                    closeHitl();

                    return {
                        success: true,
                        human_intervention_required: false,
                        next_action: result.next_action,
                        query: result.query || hitlState.originalQuery,
                    };
                }

                return {
                    success: true,
                    human_intervention_required: false,
                    next_action: result.next_action,
                    query: result.query,
                };
            } catch (err) {
                const errorMsg = (err as any).message || 'Network error during HITL response';
                console.error('[useQueryAnalyzer] HITL Error:', errorMsg, err);
                setError(errorMsg);
                return { success: false, error: errorMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [hitlState.sessionId, hitlState.originalQuery]
    );

    /**
     * Close HITL modal
     */
    const closeHitl = useCallback(() => {
        setHitlState({
            isVisible: false,
            interventionType: null,
            interventionDetails: null,
            originalQuery: '',
            sessionId: '',
        });
    }, []);

    return {
        hitlState,
        isLoading,
        error,
        analyzeQuery,
        respondToHitl,
        closeHitl,
    };
}
