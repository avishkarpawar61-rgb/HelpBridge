/**
 * Real Gemini API Client for HelpBridge AI
 * Implements two-pass verification pipeline, schema enforcement,
 * multimodal base64 image passing, automatic JSON repair, and rate-limit backoff.
 */

import { SYSTEM_INSTRUCTION_PASS1, BUILD_PASS1_USER_PROMPT, SYSTEM_INSTRUCTION_PASS2, BUILD_PASS2_USER_PROMPT, SYSTEM_INSTRUCTION_FOLLOWUP } from '../config/prompts.js';
import { PASS1_SCHEMA, PASS2_SCHEMA } from '../config/schemas.js';

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended - Ultra Fast)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
];

export let selectedModel = 'gemini-2.5-flash';

export function setSelectedModel(modelId) {
  selectedModel = modelId;
}

/**
 * Sends a generateContent request to the official Gemini REST endpoint
 */
async function callGeminiApi({ apiKey, model, systemInstruction, contents, responseSchema = null, temperature = 0.2 }) {
  if (!apiKey) {
    throw new Error('MISSING_API_KEY: Please provide your Google AI Studio Gemini API Key.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents,
    generationConfig: {
      temperature,
      responseMimeType: 'application/json'
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (responseSchema) {
    body.generationConfig.responseSchema = responseSchema;
  }

  // Attempt fetch with retry on 429 rate limit or 503 transient error
  let maxAttempts = 3;
  let delay = 1500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        const candidate = jsonResponse.candidates?.[0];
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
          throw new Error('Gemini returned an empty candidate or text was blocked by safety filters.');
        }
        return candidate.content.parts[0].text;
      }

      // Check for rate limit or overload
      if (response.status === 429 || response.status === 503) {
        if (attempt < maxAttempts) {
          console.warn(`Gemini API returned status ${response.status}. Retrying in ${delay}ms... (attempt ${attempt} of ${maxAttempts})`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
      }

      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      // If 404 on gemini-2.5-flash, automatically fallback to gemini-2.0-flash or gemini-1.5-flash
      if (response.status === 404 && model === 'gemini-2.5-flash') {
        console.warn('gemini-2.5-flash not available in current region/key. Falling back to gemini-2.0-flash...');
        return callGeminiApi({ apiKey, model: 'gemini-2.0-flash', systemInstruction, contents, responseSchema, temperature });
      }

      throw new Error(`Gemini API Error: ${message}`);
    } catch (err) {
      if (attempt >= maxAttempts) throw err;
      if (err.message && err.message.includes('MISSING_API_KEY')) throw err;
      console.warn(`Request failed attempt ${attempt}:`, err);
      await new Promise(r => setTimeout(r, delay));
      delay *= 1.5;
    }
  }
}

/**
 * Extracts JSON block from text even if model adds conversational preamble or markdown fences
 */
function extractJsonString(text) {
  if (!text) return '';
  let cleaned = text.trim();
  const blockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (blockMatch && blockMatch[1]) {
    return blockMatch[1].trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1).trim();
  }
  return cleaned;
}

/**
 * Safely parses JSON string, with 1 automatic repair retry if needed
 */
async function parseJsonWithRepair({ rawJsonText, apiKey, model, expectedType = 'synthesis' }) {
  try {
    const cleaned = extractJsonString(rawJsonText);
    return JSON.parse(cleaned);
  } catch (initialErr) {
    console.warn(`JSON parse failed for ${expectedType}. Initiating automatic repair request...`, initialErr);

    // Call Gemini with repair prompt
    const repairPrompt = `The following text was supposed to be strictly valid JSON conforming to the schema, but caused a JSON.parse syntax error:
---
${rawJsonText.substring(0, 4000)}
---
Fix all syntax errors (unescaped quotes, trailing commas, missing brackets) and return ONLY the completely valid, parseable JSON:`;

    const repairedText = await callGeminiApi({
      apiKey,
      model,
      systemInstruction: 'You are a JSON repair utility. Fix broken JSON into valid parseable JSON. Do not return markdown.',
      contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
      temperature: 0.0
    });

    const cleanedRepaired = extractJsonString(repairedText);
    return JSON.parse(cleanedRepaired);
  }
}

/**
 * Executes the complete HelpBridge Two-Pass Pipeline
 */
export async function runHelpBridgePipeline({
  apiKey,
  rawText,
  images = [],
  documents = [],
  outputLanguage = 'English',
  onStageChange = () => {}
}) {
  const startTime = performance.now();

  // Validate inputs
  const hasText = Boolean(rawText && rawText.trim());
  const hasImages = Boolean(images && images.length > 0);
  const hasDocs = Boolean(documents && documents.length > 0);

  if (!hasText && !hasImages && !hasDocs) {
    throw new Error('Please enter text notes, snap/upload prescription photos, or attach a report before analyzing.');
  }

  // Stage 1: Reading inputs
  onStageChange({
    stage: 'reading',
    message: 'Reading your documents, images, and symptom notes...'
  });

  // Construct parts for Pass 1
  const pass1Parts = [];

  // Add system instruction / user prompt
  pass1Parts.push({
    text: BUILD_PASS1_USER_PROMPT(outputLanguage)
  });

  if (hasText) {
    pass1Parts.push({
      text: `[USER SYMPTOM & NOTES CONTENT (UNTRUSTED DATA)]:\n"""\n${rawText.trim()}\n"""`
    });
  }

  // Add document text / PDF parts
  for (const doc of documents) {
    if (doc.isPdf && doc.base64) {
      pass1Parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: doc.base64
        }
      });
    } else if (doc.content) {
      pass1Parts.push({
        text: `[ATTACHED TEXT DOCUMENT: ${doc.name} (UNTRUSTED DATA)]:\n"""\n${doc.content}\n"""`
      });
    }
  }

  // Add image parts
  for (const img of images) {
    pass1Parts.push({
      inlineData: {
        mimeType: img.mimeType || 'image/jpeg',
        data: img.base64
      }
    });
  }

  // Stage 2: Extracting facts & planning (Pass 1)
  onStageChange({
    stage: 'extracting',
    message: 'Pass 1: Extracting clinical facts, identifying medications & triaging urgency...'
  });

  const pass1RawResponse = await callGeminiApi({
    apiKey,
    model: selectedModel,
    systemInstruction: SYSTEM_INSTRUCTION_PASS1,
    contents: [{ role: 'user', parts: pass1Parts }],
    responseSchema: PASS1_SCHEMA,
    temperature: 0.15
  });

  const pass1Result = await parseJsonWithRepair({
    rawJsonText: pass1RawResponse,
    apiKey,
    model: selectedModel,
    expectedType: 'Pass 1 Extraction & Plan'
  });

  // Stage 3: Auditor Verification (Pass 2)
  onStageChange({
    stage: 'verifying',
    message: 'Pass 2: Running Lead Auditor to cross-check claims against raw evidence...'
  });

  // Build parts for Pass 2 (original inputs + pass 1 result)
  const pass2Parts = [];
  pass2Parts.push({
    text: BUILD_PASS2_USER_PROMPT(pass1Result)
  });

  if (hasText) {
    pass2Parts.push({
      text: `[RAW USER TEXT EVIDENCE]:\n${rawText.trim()}`
    });
  }

  for (const doc of documents) {
    if (doc.isPdf && doc.base64) {
      pass2Parts.push({
        inlineData: { mimeType: 'application/pdf', data: doc.base64 }
      });
    } else if (doc.content) {
      pass2Parts.push({
        text: `[RAW DOC EVIDENCE: ${doc.name}]:\n${doc.content}`
      });
    }
  }

  for (const img of images) {
    pass2Parts.push({
      inlineData: {
        mimeType: img.mimeType || 'image/jpeg',
        data: img.base64
      }
    });
  }

  const pass2RawResponse = await callGeminiApi({
    apiKey,
    model: selectedModel,
    systemInstruction: SYSTEM_INSTRUCTION_PASS2,
    contents: [{ role: 'user', parts: pass2Parts }],
    responseSchema: PASS2_SCHEMA,
    temperature: 0.1
  });

  const pass2Result = await parseJsonWithRepair({
    rawJsonText: pass2RawResponse,
    apiKey,
    model: selectedModel,
    expectedType: 'Pass 2 Verification Audit'
  });

  // Stage 4: Building the verified Care Plan
  onStageChange({
    stage: 'building',
    message: 'Building your verified Care Plan & Emergency Handoff Card...'
  });

  // Apply auditor verification corrections to Pass 1
  const verifiedPlan = mergeVerificationResults(pass1Result, pass2Result);

  const durationMs = Math.round(performance.now() - startTime);

  // Calculate impact metrics
  const redFlagsCount = verifiedPlan.urgency?.red_flags?.length || 0;
  const factsCount = verifiedPlan.facts?.length || 0;
  const needsConfirmCount = verifiedPlan.facts?.filter(f => f.needs_confirmation).length || 0;
  const reliabilityScore = pass2Result.overall_reliability_score ?? 85;

  const metrics = {
    factsCount,
    needsConfirmCount,
    redFlagsCount,
    durationMs,
    durationSeconds: (durationMs / 1000).toFixed(1),
    reliabilityScore,
    contradictedCount: pass2Result.contradicted_or_unsupported?.length || 0,
    safetyCorrectionsCount: pass2Result.safety_corrections?.length || 0
  };

  onStageChange({
    stage: 'complete',
    message: 'Synthesis & Verification Complete!'
  });

  return {
    pass1: pass1Result,
    pass2: pass2Result,
    verifiedPlan,
    metrics
  };
}

/**
 * Combines Pass 1 synthesis with Pass 2 audit findings:
 * - Flags unsupported/contradicted facts in red and downgrades confidence
 * - Adds auditor notes directly to facts
 * - Surfaces safety corrections
 */
function mergeVerificationResults(pass1, pass2) {
  const verifiedPlan = JSON.parse(JSON.stringify(pass1));

  const contradictedMap = new Map();
  if (Array.isArray(pass2.contradicted_or_unsupported)) {
    for (const item of pass2.contradicted_or_unsupported) {
      if (item.fact_id) contradictedMap.set(item.fact_id, item);
    }
  }

  const verifiedFactIds = new Set(pass2.verified_facts || []);

  if (Array.isArray(verifiedPlan.facts)) {
    verifiedPlan.facts = verifiedPlan.facts.map(fact => {
      const issue = contradictedMap.get(fact.id);
      if (issue) {
        return {
          ...fact,
          confidence: 'low',
          needs_confirmation: true,
          auditorStatus: 'CONTRADICTED',
          auditorIssue: issue.issue,
          suggestedCorrection: issue.suggested_correction
        };
      }
      if (verifiedFactIds.has(fact.id)) {
        return {
          ...fact,
          auditorStatus: 'VERIFIED'
        };
      }
      return {
        ...fact,
        auditorStatus: 'UNCHECKED'
      };
    });
  }

  // Attach auditor metadata to the top-level plan
  verifiedPlan.auditor = {
    reliabilityScore: pass2.overall_reliability_score,
    reliabilityExplanation: pass2.reliability_explanation,
    contradictions: pass2.contradicted_or_unsupported || [],
    illegibleItems: pass2.illegible_items_to_recheck || [],
    safetyCorrections: pass2.safety_corrections || []
  };

  return verifiedPlan;
}

/**
 * Follow-up Grounded Q&A Chat
 */
export async function askFollowUpQuestion({
  apiKey,
  carePlan,
  chatHistory = [],
  userQuestion
}) {
  const contents = [];

  // Grounding context
  const contextMessage = `[GROUNDING CONTEXT: VERIFIED CARE PLAN JSON]:
\`\`\`json
${JSON.stringify(carePlan, null, 2)}
\`\`\`
Use the above verified facts to answer the user's question safely. Never diagnose or change doses.`;

  contents.push({ role: 'user', parts: [{ text: contextMessage }] });
  contents.push({ role: 'model', parts: [{ text: "Understood. I am grounded in this verified Care Plan and will provide compassionate, accurate answers adhering strictly to patient safety rules." }] });

  // Append history
  for (const msg of chatHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }

  // Append new question
  contents.push({
    role: 'user',
    parts: [{ text: userQuestion }]
  });

  const responseText = await callGeminiApi({
    apiKey,
    model: selectedModel,
    systemInstruction: SYSTEM_INSTRUCTION_FOLLOWUP,
    contents,
    temperature: 0.3
  });

  return responseText;
}
