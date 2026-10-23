/**
 * Staged Progress Indicator Component
 * Visualizes the 4 distinct phases of the HelpBridge pipeline:
 * 1. Reading your documents
 * 2. Extracting facts
 * 3. Checking for mistakes (Pass 2 Auditor)
 * 4. Building your plan
 */

export function renderProgressIndicator(currentStage = 'reading', message = '') {
  const stages = [
    { id: 'reading', label: 'Reading Documents', icon: 'fa-book-open' },
    { id: 'extracting', label: 'Extracting Facts', icon: 'fa-wand-magic-sparkles' },
    { id: 'verifying', label: 'Checking for Mistakes', icon: 'fa-shield-halved' },
    { id: 'building', label: 'Building Your Plan', icon: 'fa-file-lines' }
  ];

  const stageOrder = ['reading', 'extracting', 'verifying', 'building', 'complete'];
  const currentIndex = stageOrder.indexOf(currentStage);

  const stepsHtml = stages.map((stg, index) => {
    let stepClass = 'progress-step';
    let iconClass = `fa-solid ${stg.icon}`;

    if (currentIndex > index) {
      stepClass += ' step-done';
      iconClass = 'fa-solid fa-circle-check';
    } else if (currentIndex === index) {
      stepClass += ' step-active';
    } else {
      stepClass += ' step-pending';
    }

    return `
      <div class="${stepClass}">
        <div class="step-icon-bubble">
          <i class="${iconClass}"></i>
        </div>
        <div class="step-label">${stg.label}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="pipeline-progress-container" id="pipeline-progress-box" role="status" aria-live="assertive">
      <div class="progress-steps-row">
        ${stepsHtml}
      </div>
      <div class="progress-status-bar">
        <div class="progress-spinner">
          <i class="fa-solid fa-circle-notch fa-spin"></i>
        </div>
        <div class="progress-message-text">${escapeHtml(message || 'Processing your medical records...')}</div>
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
