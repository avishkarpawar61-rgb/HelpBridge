/**
 * Questions for Your Doctor Component
 * Equips patients and stressed family members with targeted questions for their clinic visit.
 */

export function renderQuestionsCard(questions = []) {
  if (!questions || questions.length === 0) return '';

  const questionsListHtml = questions.map((q, idx) => {
    return `
      <li class="question-item">
        <span class="question-number">${idx + 1}</span>
        <span class="question-text">${escapeHtml(q)}</span>
      </li>
    `;
  }).join('');

  return `
    <div class="result-card questions-card" id="questions-for-doctor-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-clipboard-question"></i>
          <span>Questions For Your Doctor or Specialist (${questions.length})</span>
        </div>
        <button type="button" class="btn-copy-questions" id="copy-questions-btn" title="Copy all questions to clipboard">
          <i class="fa-regular fa-copy"></i>
          <span id="copy-btn-text">Copy Questions</span>
        </button>
      </div>
      <div class="card-body">
        <p class="questions-intro">Take these questions with you to your doctor's appointment:</p>
        <ol class="questions-list">
          ${questionsListHtml}
        </ol>
      </div>
    </div>
  `;
}

export function attachQuestionsEvents(questions = []) {
  const btn = document.getElementById('copy-questions-btn');
  const btnText = document.getElementById('copy-btn-text');

  if (!btn || questions.length === 0) return;

  btn.addEventListener('click', async () => {
    const textToCopy = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      btnText.textContent = 'Copied to Clipboard!';
      btn.classList.add('btn-copied');
      setTimeout(() => {
        btnText.textContent = 'Copy Questions';
        btn.classList.remove('btn-copied');
      }, 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  });
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
