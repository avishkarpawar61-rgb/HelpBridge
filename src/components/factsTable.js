/**
 * Verified Facts Table Component
 * Displays extracted clinical facts with confidence badges, auditor verification tags,
 * and clickable source excerpt inspectors.
 */

let activeCategoryFilter = 'all';

export function renderFactsTable(facts = [], activeFilter = 'all') {
  if (!facts || facts.length === 0) return '';
  activeCategoryFilter = activeFilter;

  const categories = ['all', ...new Set(facts.map(f => f.category))];

  const filteredFacts = activeCategoryFilter === 'all'
    ? facts
    : facts.filter(f => f.category === activeCategoryFilter);

  const filterChipsHtml = categories.map(cat => {
    const isActive = cat === activeCategoryFilter;
    const label = cat === 'all' ? 'All Facts' : cat.replace('_', ' ').toUpperCase();
    return `
      <button 
        type="button" 
        class="filter-chip ${isActive ? 'active' : ''}" 
        data-filter="${cat}"
        aria-pressed="${isActive}"
      >
        ${escapeHtml(label)}
      </button>
    `;
  }).join('');

  const rowsHtml = filteredFacts.map((fact) => {
    const isContradicted = fact.auditorStatus === 'CONTRADICTED';
    const isVerified = fact.auditorStatus === 'VERIFIED';

    let confBadge = `<span class="badge badge-conf-${fact.confidence || 'med'}">${(fact.confidence || 'medium').toUpperCase()} CONFIDENCE</span>`;
    if (isContradicted) {
      confBadge = `<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> CONTRADICTED BY AUDITOR</span>`;
    } else if (isVerified) {
      confBadge += ` <span class="badge badge-verified"><i class="fa-solid fa-check-double"></i> VERIFIED</span>`;
    }

    const needsConfirmBadge = fact.needs_confirmation
      ? `<span class="badge badge-warn"><i class="fa-solid fa-circle-exclamation"></i> Needs Re-check</span>`
      : '';

    return `
      <tr class="fact-row ${isContradicted ? 'row-contradicted' : ''}" data-fact-id="${escapeHtml(fact.id)}" tabindex="0" role="button" aria-label="View source for ${escapeHtml(fact.label)}">
        <td class="col-cat">
          <span class="category-pill cat-${escapeHtml(fact.category)}">${escapeHtml(fact.category)}</span>
        </td>
        <td class="col-fact">
          <strong>${escapeHtml(fact.label)}</strong>: <span class="fact-value">${escapeHtml(fact.value)}</span>
          ${isContradicted && fact.auditorIssue ? `
            <div class="auditor-correction-callout">
              <i class="fa-solid fa-circle-xmark"></i> <strong>Auditor Note:</strong> ${escapeHtml(fact.auditorIssue)}
              ${fact.suggestedCorrection ? `<em>(Correction: ${escapeHtml(fact.suggestedCorrection)})</em>` : ''}
            </div>
          ` : ''}
        </td>
        <td class="col-status">
          ${confBadge}
          ${needsConfirmBadge}
        </td>
        <td class="col-action">
          <button type="button" class="btn-inspect-source" data-fact-id="${escapeHtml(fact.id)}" title="Click to view raw source excerpt">
            <i class="fa-solid fa-magnifying-glass"></i> Source
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="result-card facts-card" id="facts-table-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-table-list"></i>
          <span>Extracted Clinical Facts (${facts.length})</span>
        </div>
        <div class="facts-hint">
          <i class="fa-solid fa-hand-pointer"></i>
          <span>Click any fact row to inspect its exact source excerpt</span>
        </div>
      </div>
      <div class="card-body">
        <div class="filter-chips-row" id="facts-filter-chips">
          ${filterChipsHtml}
        </div>
        <div class="table-responsive">
          <table class="facts-table">
            <thead>
              <tr>
                <th scope="col" style="width: 15%">Category</th>
                <th scope="col" style="width: 50%">Clinical Item & Extracted Value</th>
                <th scope="col" style="width: 25%">Audit Confidence</th>
                <th scope="col" style="width: 10%">Evidence</th>
              </tr>
            </thead>
            <tbody id="facts-table-body">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Source Excerpt Modal -->
    <div class="modal-backdrop" id="source-excerpt-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="modal-fact-title">
      <div class="modal-card">
        <div class="modal-header">
          <h3 id="modal-fact-title"><i class="fa-solid fa-file-circle-check"></i> Source Evidence Inspector</h3>
          <button type="button" class="btn-close-modal" id="close-source-modal-btn" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body" id="modal-fact-content">
          <!-- Populated dynamically -->
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="close-modal-footer-btn">Close</button>
        </div>
      </div>
    </div>
  `;
}

export function attachFactsEvents(facts = [], onFilterChange) {
  // Category filter chips
  const chipsContainer = document.getElementById('facts-filter-chips');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (chip && onFilterChange) {
        const filter = chip.dataset.filter;
        onFilterChange(filter);
      }
    });
  }

  // Row inspection
  const tableBody = document.getElementById('facts-table-body');
  const modal = document.getElementById('source-excerpt-modal');
  const modalContent = document.getElementById('modal-fact-content');
  const closeBtns = [
    document.getElementById('close-source-modal-btn'),
    document.getElementById('close-modal-footer-btn')
  ];

  if (tableBody && modal && modalContent) {
    tableBody.addEventListener('click', (e) => {
      const row = e.target.closest('.fact-row');
      if (row) {
        const factId = row.dataset.factId;
        const fact = facts.find(f => f.id === factId);
        if (fact) {
          openFactModal(fact);
        }
      }
    });

    closeBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => { modal.style.display = 'none'; });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  function openFactModal(fact) {
    modalContent.innerHTML = `
      <div class="inspect-item">
        <div class="inspect-label">Extracted Clinical Fact</div>
        <div class="inspect-value"><strong>${escapeHtml(fact.label)}</strong>: ${escapeHtml(fact.value)}</div>
      </div>
      <div class="inspect-item">
        <div class="inspect-label">Category & Assigned Confidence</div>
        <div class="inspect-value">
          <span class="category-pill cat-${escapeHtml(fact.category)}">${escapeHtml(fact.category)}</span>
          <span class="badge badge-conf-${fact.confidence || 'med'}">${(fact.confidence || 'medium').toUpperCase()}</span>
        </div>
      </div>
      <div class="inspect-item excerpt-highlight-box">
        <div class="inspect-label"><i class="fa-solid fa-quote-left"></i> Verbatim Evidence / Location in Source</div>
        <blockquote class="source-excerpt-text">"${escapeHtml(fact.source_excerpt || 'No specific visual excerpt recorded')}"</blockquote>
      </div>
      ${fact.needs_confirmation ? `
        <div class="alert-box-warning">
          <i class="fa-solid fa-circle-exclamation"></i>
          <strong>Needs Confirmation:</strong> This item is handwritten or partially ambiguous. Ask your doctor or pharmacist to physically verify before taking action.
        </div>
      ` : ''}
    `;
    modal.style.display = 'flex';
  }
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
