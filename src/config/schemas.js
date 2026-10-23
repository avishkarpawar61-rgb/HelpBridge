/**
 * Gemini API Schemas for Pass 1 (Extract & Plan) and Pass 2 (Verify)
 * Used in responseSchema with responseMimeType: "application/json"
 */

export const PASS1_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "2-3 sentence plain-language summary of what is happening in the requested output language at Grade 6 reading level."
    },
    language_detected: {
      type: "STRING",
      description: "Detected primary language of the user input documents/notes."
    },
    urgency: {
      type: "OBJECT",
      properties: {
        level: {
          type: "STRING",
          enum: ["EMERGENCY", "URGENT_24H", "SOON_THIS_WEEK", "ROUTINE", "INSUFFICIENT_INFO"],
          description: "Triage urgency level based on clinical red flags."
        },
        rationale: {
          type: "STRING",
          description: "Clear explanation for the assigned urgency."
        },
        red_flags: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of explicit red flag symptoms detected, if any (e.g. chest pain, infant fever >103F, stroke signs)."
        }
      },
      required: ["level", "rationale", "red_flags"]
    },
    facts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          category: {
            type: "STRING",
            enum: ["symptom", "medication", "condition", "lab_value", "allergy", "vital", "history", "other"]
          },
          label: { type: "STRING" },
          value: { type: "STRING" },
          source_excerpt: {
            type: "STRING",
            description: "Verbatim quote or precise visual location in the image/text where this fact was read."
          },
          confidence: {
            type: "STRING",
            enum: ["high", "medium", "low"]
          },
          needs_confirmation: { type: "BOOLEAN" }
        },
        required: ["id", "category", "label", "value", "source_excerpt", "confidence", "needs_confirmation"]
      }
    },
    medications: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dose: { type: "STRING" },
          frequency: { type: "STRING" },
          purpose_if_stated: { type: "STRING" },
          legibility: {
            type: "STRING",
            enum: ["clear", "uncertain"]
          },
          possible_concerns: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Cautious safety notes framed as 'Ask your pharmacist to verify', e.g. duplicate drugs, allergy conflicts."
          }
        },
        required: ["name", "dose", "frequency", "legibility", "possible_concerns"]
      }
    },
    abnormal_findings: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          item: { type: "STRING" },
          value: { type: "STRING" },
          reference_range_if_present: { type: "STRING" },
          plain_explanation: { type: "STRING" }
        },
        required: ["item", "value", "plain_explanation"]
      }
    },
    missing_information: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Critical clinical details not provided in the inputs that a doctor would need."
    },
    actions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          step: { type: "STRING" },
          priority: { type: "INTEGER" },
          who: {
            type: "STRING",
            enum: ["self", "caregiver", "doctor", "emergency_services"]
          },
          timeframe: { type: "STRING" },
          why: { type: "STRING" }
        },
        required: ["step", "priority", "who", "timeframe", "why"]
      }
    },
    questions_for_doctor: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "High-value questions for the patient or family to ask their clinician or pharmacist."
    },
    emergency_card: {
      type: "OBJECT",
      properties: {
        patient_descriptor: { type: "STRING" },
        key_conditions: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        current_medications: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        allergies: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        recent_findings: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        what_happened: { type: "STRING" },
        suggested_attention_level: { type: "STRING" }
      },
      required: ["patient_descriptor", "key_conditions", "current_medications", "allergies", "recent_findings", "what_happened", "suggested_attention_level"]
    },
    disclaimer: {
      type: "STRING",
      description: "Standard safety disclaimer stating this is AI synthesis, not medical advice."
    }
  },
  required: [
    "summary",
    "language_detected",
    "urgency",
    "facts",
    "medications",
    "abnormal_findings",
    "missing_information",
    "actions",
    "questions_for_doctor",
    "emergency_card",
    "disclaimer"
  ]
};

export const PASS2_SCHEMA = {
  type: "OBJECT",
  properties: {
    verified_facts: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of fact IDs from Pass 1 that are strictly corroborated by the raw input documents."
    },
    contradicted_or_unsupported: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          fact_id: { type: "STRING" },
          issue: { type: "STRING" },
          suggested_correction: { type: "STRING" }
        },
        required: ["fact_id", "issue", "suggested_correction"]
      },
      description: "Facts that hallucinated, exaggerated, or misinterpreted raw inputs."
    },
    illegible_items_to_recheck: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          item: { type: "STRING" },
          note: { type: "STRING" }
        },
        required: ["item", "note"]
      },
      description: "Text or numbers in the raw files that were blurry/ambiguous and must be re-verified by human eyes."
    },
    safety_corrections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING" },
          warning: { type: "STRING" },
          recommendation: { type: "STRING" }
        },
        required: ["type", "warning", "recommendation"]
      },
      description: "Clinical safety caveats missed in Pass 1, such as missed drug conflicts or under-triaged symptoms."
    },
    overall_reliability_score: {
      type: "INTEGER",
      description: "Score from 0 to 100 reflecting input clarity, completeness, and audit confidence."
    },
    reliability_explanation: {
      type: "STRING",
      description: "Brief rationale explaining why this score was given."
    }
  },
  required: [
    "verified_facts",
    "contradicted_or_unsupported",
    "illegible_items_to_recheck",
    "safety_corrections",
    "overall_reliability_score",
    "reliability_explanation"
  ]
};
