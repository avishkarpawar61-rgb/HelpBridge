/**
 * Verification & Reliability Auditor Panel (Pass 2)
 * Surfaces adversarial auditor findings, the 0-100 reliability score,
 * contradicted claims, illegible items to re-check, and safety corrections.
 */

export function renderVerificationCard(auditorData) {
  if (!auditorData) return '';

  const {
    reliabilityScore = 85,
    reliabilityExplanation = 'Synthesis reviewed against raw evidence.',
    contradictions = [],
    illegibleItems = [],
    safetyCorrections = []
  } = auditorData;

  const scoreColor = reliabilityScore >= 80 ? '#10b981' : reliabilityScore >= 60 ? '#f59e0b' : '#ef4444';
  const scoreTier = reliabilityScore >= 80 ? 'High Confidence' : reliabilityScore >= 60 ? 'Moderate / Verify Carefully' : 'Caution Required';

  const contradictionsHtml = contradictions.length > 0
    ? `
      <div class="audit-section audit-contradictions">
        <div class="audit-section-header">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <strong>Unsubstantiated or Contradicted Items (${contradictions.length})</strong>
        </div>
        <p class="audit-section-desc">The auditor flagged these items because they could not be reliably verified in the raw notes or images:</p>
        <div class="audit-items-list">
          ${contradictions.map(item => `
            <div class="audit-item audit-item-danger">
              <div class="audit-fact-id">Fact Reference: <code>${escapeHtml(item.fact_id)}</code></div>
              <div class="audit-issue"><strong>Discrepancy:</strong> ${escapeHtml(item.issue)}</div>
              ${item.suggested_correction ? `<div class="audit-suggestion"><strong>Recommended Correction:</strong> ${escapeHtml(item.suggested_correction)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `
    : `
      <div class="audit-section audit-clean">
        <i class="fa-solid fa-circle-check"></i>
        <span>No hallucinated or contradictory statements detected in Pass 1.</span>
      </div>
    `;

  const illegibleHtml = illegibleItems.length > 0
    ? `
      <div class="audit-section audit-illegible">
        <div class="audit-section-header">
          <i class="fa-solid fa-eye-slash"></i>
          <strong>Ambiguous or Illegible Text Requiring Human Eyes (${illegibleItems.length})</strong>
        </div>
        <ul class="audit-illegible-list">
          ${illegibleItems.map(item => `
            <li>
              <strong>${escapeHtml(item.item)}</strong>: ${escapeHtml(item.note)}
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : '';

  const safetyHtml = safetyCorrections.length > 0
    ? `
      <div class="audit-section audit-safety">
        <div class="audit-section-header">
          <i class="fa-solid fa-shield-halved"></i>
          <strong>Auditor Safety Caveats & Interactions (${safetyCorrections.length})</strong>
        </div>
        <div class="safety-cards-grid">
          ${safetyCorrections.map(sc => `
            <div class="safety-card">
              <span class="safety-type">${escapeHtml(sc.type || 'Safety Notice')}</span>
              <p class="safety-warning"><strong>Warning:</strong> ${escapeHtml(sc.warning)}</p>
              <p class="safety-rec"><strong>Action:</strong> ${escapeHtml(sc.recommendation)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <div class="result-card verification-card" id="verification-panel-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-shield-check"></i>
          <span>Pass 2 Verification & Reliability Audit</span>
        </div>
        <span class="badge badge-verified">
          <i class="fa-solid fa-microchip"></i> Two-Pass Verified
        </span>
      </div>
      <div class="card-body">
        <div class="audit-score-container">
          <div class="score-circle-wrapper">
            <div class="score-circle" style="border-color: ${scoreColor}">
              <span class="score-number">${reliabilityScore}</span>
              <span class="score-unit">/ 100</span>
            </div>
          </div>
          <div class="score-details">
            <div class="score-tier" style="color: ${scoreColor}">${scoreTier}</div>
            <p class="score-explanation">${escapeHtml(reliabilityExplanation)}</p>
          </div>
        </div>

        ${contradictionsHtml}
        ${illegibleHtml}
        ${safetyHtml}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
