/**
 * Abnormal Findings & Missing Clinical Information Component
 * Displays flagged out-of-range lab tests, vital anomalies, and critical clinical gaps.
 */

export function renderAbnormalCard(abnormalFindings = [], missingInfo = []) {
  const hasAbnormal = abnormalFindings && abnormalFindings.length > 0;
  const hasMissing = missingInfo && missingInfo.length > 0;

  if (!hasAbnormal && !hasMissing) return '';

  const findingsHtml = hasAbnormal
    ? abnormalFindings.map(find => {
      return `
        <div class="abnormal-item">
          <div class="abnormal-header">
            <span class="abnormal-item-name">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <strong>${escapeHtml(find.item)}</strong>
            </span>
            <span class="abnormal-value-pill">${escapeHtml(find.value)}</span>
          </div>
          ${find.reference_range_if_present ? `
            <div class="abnormal-ref-range">
              <span class="label">Reference Range:</span>
              <span class="value">${escapeHtml(find.reference_range_if_present)}</span>
            </div>
          ` : ''}
          <p class="abnormal-plain-explanation">${escapeHtml(find.plain_explanation)}</p>
        </div>
      `;
    }).join('')
    : '<p class="empty-state-text">No significant lab or vital abnormalities flagged.</p>';

  const missingHtml = hasMissing
    ? `
      <div class="missing-info-box">
        <div class="missing-info-title">
          <i class="fa-solid fa-clipboard-question"></i>
          <strong>Missing Information a Doctor Needs Answered:</strong>
        </div>
        <ul class="missing-info-list">
          ${missingInfo.map(info => `<li>${escapeHtml(info)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  return `
    <div class="result-card abnormal-card" id="abnormal-findings-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-flask-vial"></i>
          <span>Abnormal Findings & Critical Information Gaps</span>
        </div>
      </div>
      <div class="card-body">
        <div class="abnormal-list">
          ${findingsHtml}
        </div>
        ${missingHtml}
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
