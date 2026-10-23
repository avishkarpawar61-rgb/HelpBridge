/**
 * Plain-Language Summary Card Component
 * Includes Grade 6 simplified summary and Web Speech TTS "Read Aloud" button.
 */

import { speechService } from '../services/speech.js';

let isSpeaking = false;

export function renderSummaryCard(summary, languageDetected = '', outputLanguage = 'English') {
  if (!summary) return '';

  return `
    <div class="result-card summary-card" id="summary-card-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-file-waveform"></i>
          <span>What Is Actually Going On</span>
        </div>
        <div class="header-actions">
          ${languageDetected ? `<span class="badge badge-subtle">Input: ${escapeHtml(languageDetected)}</span>` : ''}
          <button 
            type="button" 
            class="btn-tts" 
            id="read-aloud-btn" 
            aria-label="Read plan aloud" 
            title="Listen to this plain-language summary"
          >
            <i class="fa-solid fa-volume-high" id="tts-icon"></i>
            <span id="tts-btn-text">Read Aloud</span>
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="summary-text-box">
          <p class="summary-text" id="summary-text-content">${escapeHtml(summary)}</p>
        </div>
        <div class="reading-level-note">
          <i class="fa-solid fa-feather"></i>
          <span>Simplified for patient & family understanding (~Grade 6 reading level in ${escapeHtml(outputLanguage)}).</span>
        </div>
      </div>
    </div>
  `;
}

export function attachSummaryEvents(summaryText, outputLanguage) {
  const btn = document.getElementById('read-aloud-btn');
  const icon = document.getElementById('tts-icon');
  const textSpan = document.getElementById('tts-btn-text');

  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = 'true';

  btn.addEventListener('click', () => {
    if (speechService.isSpeaking()) {
      speechService.stopSpeaking();
      updateTtsButton(false);
    } else {
      updateTtsButton(true);
      speechService.readAloud(summaryText, outputLanguage, () => {
        updateTtsButton(false);
      });
    }
  });

  function updateTtsButton(speaking) {
    if (speaking) {
      btn.classList.add('is-speaking');
      icon.className = 'fa-solid fa-circle-stop pulse-animation';
      textSpan.textContent = 'Stop Reading';
    } else {
      btn.classList.remove('is-speaking');
      icon.className = 'fa-solid fa-volume-high';
      textSpan.textContent = 'Read Aloud';
    }
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
