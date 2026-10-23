/**
 * Before → After Comparison Component
 * Designed specifically for live hackathon judges and demos.
 * Compares the chaotic, messy raw input side-by-side with the structured, verified output.
 */

export function renderBeforeAfterToggle(activeView = 'after') {
  return `
    <div class="before-after-bar no-print" id="before-after-nav" role="toolbar" aria-label="Demo View Switcher">
      <div class="toggle-pill-group">
        <button 
          type="button" 
          class="btn-toggle-view ${activeView === 'before' ? 'active' : ''}" 
          id="btn-view-before" 
          aria-pressed="${activeView === 'before'}"
        >
          <i class="fa-solid fa-box-archive"></i>
          <span>Before (Messy Raw Input)</span>
        </button>
        <button 
          type="button" 
          class="btn-toggle-view ${activeView === 'split' ? 'active' : ''}" 
          id="btn-view-split" 
          aria-pressed="${activeView === 'split'}"
        >
          <i class="fa-solid fa-table-columns"></i>
          <span>Side-by-Side (Demo View)</span>
        </button>
        <button 
          type="button" 
          class="btn-toggle-view ${activeView === 'after' ? 'active' : ''}" 
          id="btn-view-after" 
          aria-pressed="${activeView === 'after'}"
        >
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>After (Verified Care Plan)</span>
        </button>
      </div>
    </div>
  `;
}

export function renderRawBeforePanel({ rawText, images = [], documents = [] }) {
  const imagesHtml = images.length > 0
    ? `
      <div class="raw-section">
        <h4><i class="fa-solid fa-images"></i> Attached Photos & Prescriptions (${images.length})</h4>
        <div class="raw-images-grid">
          ${images.map(img => `
            <div class="raw-image-card">
              <img src="${img.dataUrl}" alt="${escapeHtml(img.name)}" class="raw-preview-thumb" />
              <div class="raw-image-caption">${escapeHtml(img.name)} (${Math.round((img.sizeBytes || 0) / 1024)} KB)</div>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  const docsHtml = documents.length > 0
    ? `
      <div class="raw-section">
        <h4><i class="fa-solid fa-file-lines"></i> Attached Documents (${documents.length})</h4>
        <div class="raw-docs-list">
          ${documents.map(d => `
            <div class="raw-doc-item">
              <i class="fa-solid ${d.isPdf ? 'fa-file-pdf' : 'fa-file-lines'}"></i>
              <span>${escapeHtml(d.name)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  const textHtml = rawText && rawText.trim()
    ? `
      <div class="raw-section">
        <h4><i class="fa-solid fa-quote-left"></i> Unstructured Symptoms & Audio Transcripts</h4>
        <div class="raw-text-block">
          <pre>${escapeHtml(rawText)}</pre>
        </div>
      </div>
    `
    : '<p class="empty-state-text">No free text or transcript provided.</p>';

  return `
    <div class="raw-before-container" id="raw-before-view">
      <div class="before-banner">
        <i class="fa-solid fa-circle-info"></i>
        <span><strong>RAW UNSTRUCTURED INPUT:</strong> The chaotic real-world data provided by the patient or caregiver before HelpBridge processing.</span>
      </div>
      ${textHtml}
      ${imagesHtml}
      ${docsHtml}
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
