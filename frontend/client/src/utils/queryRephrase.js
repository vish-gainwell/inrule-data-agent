/**
 * Query Rephrasing Utility
 * 
 * Intelligently combines original query with user corrections
 * to generate the final query that will be sent to the LLM
 */

/**
 * Extract the correction pattern from user input
 * Looks for patterns like:
 * - "use CPT 99213 instead of 123"
 * - "replace 123 with 99213"
 * - "change code to 99213"
 * - "use 99213"
 */
function extractCodeReplacement(userCorrection) {
  const patterns = [
    // "use X instead of Y" or "use X instead"
    /use\s+(?:CPT|cpt|code)?\s*(\d+[FT]?|\w+)\s+instead\s+of\s+(\d+[FT]?|\w+)/i,
    // "use X" with context
    /use\s+(?:CPT|cpt|code)?\s*(\d+[FT]?|\w+)/i,
    // "replace X with Y"
    /replace\s+(\d+[FT]?|\w+)\s+with\s+(\d+[FT]?|\w+)/i,
    // "change to X"
    /change\s+(?:to|code)?\s*(\d+[FT]?|\w+)/i,
  ];

  for (const pattern of patterns) {
    const match = userCorrection.match(pattern);
    if (match) {
      return {
        newCode: match[1],
        oldCode: match[2] || null,
      };
    }
  }

  return null;
}

/**
 * Apply user correction to original query
 * Intelligently replaces invalid codes with suggested ones
 */
export function rephraseQuery(originalQuery, userCorrection, invalidCodes = []) {
  const correction = extractCodeReplacement(userCorrection);

  if (correction && correction.newCode) {
    // If we found a code replacement pattern, apply it
    let rephrasedQuery = originalQuery;

    // Try to replace invalid codes with the new code
    if (invalidCodes && invalidCodes.length > 0) {
      invalidCodes.forEach((invalidCode) => {
        const regex = new RegExp(`\\b${invalidCode}\\b`, 'gi');
        rephrasedQuery = rephrasedQuery.replace(regex, correction.newCode);
      });
    } else if (correction.oldCode) {
      // If no invalid codes provided, use the oldCode from pattern
      const regex = new RegExp(`\\b${correction.oldCode}\\b`, 'gi');
      rephrasedQuery = rephrasedQuery.replace(regex, correction.newCode);
    }

    return rephrasedQuery;
  }

  // If it's additional context (not a replacement), append it
  // Check if user is adding context like "established patient visit"
  if (userCorrection.toLowerCase().includes('visit') || 
      userCorrection.toLowerCase().includes('patient') ||
      userCorrection.toLowerCase().includes('procedure')) {
    // Could append the context, but for now just use the new code if present
    return originalQuery;
  }

  // Fallback: if user typed a completely different query
  // (longer, more complex), use it as-is
  if (userCorrection.length > 20) {
    return userCorrection;
  }

  // Default: return original if we can't parse the correction
  return originalQuery;
}

/**
 * Generate query preview text with explanation
 */
export function generatePreviewExplanation(originalQuery, userCorrection, rephrasedQuery) {
  if (rephrasedQuery === originalQuery) {
    return "No changes detected in the query.";
  }

  // Check if codes were replaced
  const codePattern = /\d+[FT]?/;
  const originalCodes = originalQuery.match(codePattern);
  const rephrasedCodes = rephrasedQuery.match(codePattern);

  if (originalCodes && rephrasedCodes && originalCodes[0] !== rephrasedCodes[0]) {
    return `Code will be replaced: ${originalCodes[0]} → ${rephrasedCodes[0]}`;
  }

  if (userCorrection.length > originalQuery.length) {
    return "Your correction will be used to update the query.";
  }

  return "Query has been rephrased based on your input.";
}
