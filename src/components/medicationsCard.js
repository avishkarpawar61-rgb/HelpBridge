/**
 * Medications & Concerns Component
 * Lists extracted drugs, frequencies, legibility status, and pharmacist safety checks.
 */

export function renderMedicationsCard(medications = []) {
  if (!medications || medications.length === 0) {
    return `
      <div class="result-card meds-card" id="medications-section">
        <div class="card-header">
          <div class="card-title">
            <i class="fa-solid fa-pills"></i>
            <span>Medications & Prescriptions</span>
          </div>
        </div>
        <div class="card-body">
          <p class="empty-state-text">No prescription medications detected in the provided inputs.</p>
        </div>
      </div>
    `;
  }

  const medsHtml = medications.map(med => {
    const isUncertain = med.legibility === 'uncertain';
    const hasConcerns = med.possible_concerns && med.possible_concerns.length > 0;

    const legibilityBadge = isUncertain
      ? `<span class="badge badge-warn"><i class="fa-solid fa-eye-slash"></i> Handwriting Uncertain</span>`
      : `<span class="badge badge-subtle"><i class="fa-solid fa-check"></i> Legible</span>`;

    const concernsHtml = hasConcerns
      ? `
        <div class="med-concerns-box">
          <div class="concerns-title">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <strong>Ask Your Pharmacist to Verify:</strong>
          </div>
          <ul class="concerns-list">
            ${med.possible_concerns.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    return `
      <div class="med-card-item ${isUncertain ? 'med-item-uncertain' : ''}">
        <div class="med-header">
          <div class="med-name-group">
            <span class="med-icon"><i class="fa-solid fa-capsules"></i></span>
            <strong class="med-name">${escapeHtml(med.name)}</strong>
            <span class="med-dose">${escapeHtml(med.dose || 'Dose not specified')}</span>
          </div>
          <div class="med-legibility">
            ${legibilityBadge}
          </div>
        </div>
        <div class="med-details-grid">
          <div class="med-detail">
            <span class="detail-label">Schedule / Frequency:</span>
            <span class="detail-value">${escapeHtml(med.frequency || 'As directed')}</span>
          </div>
          ${med.purpose_if_stated ? `
            <div class="med-detail">
              <span class="detail-label">Stated Purpose:</span>
              <span class="detail-value">${escapeHtml(med.purpose_if_stated)}</span>
            </div>
          ` : ''}
        </div>
        ${concernsHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="result-card meds-card" id="medications-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-pills"></i>
          <span>Medications & Safety Concerns (${medications.length})</span>
        </div>
        <div class="meds-caution-tag">
          <i class="fa-solid fa-circle-info"></i>
          <span>Always confirm with your dispensing pharmacist</span>
        </div>
      </div>
      <div class="card-body">
        <div class="meds-list">
          ${medsHtml}
        </div>
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
