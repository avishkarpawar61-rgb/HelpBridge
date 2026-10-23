/**
 * Input Panel Component
 * Multi-modal inputs: Free text, Voice recognition (en-IN, hi-IN, mr-IN),
 * Camera & Image uploads (with compression), PDF/file uploads,
 * Output language selector, and 3 one-click synthetic demo scenarios.
 */

import { speechService } from '../services/speech.js';
import { processImageFile, processDocumentFile, canvasToImageData } from '../services/fileProcessor.js';
import { DEMO_SCENARIOS } from '../data/scenarios.js';
import { store } from '../services/storage.js';
import { DOMAIN_LENSES, ACTIVE_LENS_ID } from '../config/lenses.js';

export function renderInputPanel(state) {
  const isSpeechSupported = speechService.isSupported();
  const activeLens = DOMAIN_LENSES[ACTIVE_LENS_ID];

  const scenariosHtml = DEMO_SCENARIOS.map(sc => {
    const isCurrent = state.activeScenarioId === sc.id;
    return `
      <button 
        type="button" 
        class="scenario-card-btn ${isCurrent ? 'active' : ''} ${sc.id === 'scenario_c' ? 'scenario-alert' : ''}" 
        data-scenario-id="${sc.id}"
        title="Load ${escapeHtml(sc.title)}"
      >
        <div class="scenario-top">
          <span class="scenario-badge ${sc.id === 'scenario_c' ? 'badge-danger' : 'badge-subtle'}">
            ${escapeHtml(sc.badge)}
          </span>
          <span class="synthetic-tag">SYNTHETIC DEMO</span>
        </div>
        <div class="scenario-name">${escapeHtml(sc.title)}</div>
        <div class="scenario-desc">${escapeHtml(sc.description)}</div>
      </button>
    `;
  }).join('');

  const imageThumbnailsHtml = state.images.length > 0
    ? `
      <div class="attached-thumbnails-strip" id="images-preview-strip">
        ${state.images.map(img => `
          <div class="thumb-card" data-img-id="${img.id}">
            <img src="${img.dataUrl}" alt="${escapeHtml(img.name)}" class="thumb-img" />
            <button type="button" class="btn-remove-thumb" data-img-id="${img.id}" title="Remove image" aria-label="Remove image">&times;</button>
            <div class="thumb-caption">${escapeHtml(img.name)}</div>
          </div>
        `).join('')}
      </div>
    `
    : '';

  const docThumbnailsHtml = state.uploadedFiles.length > 0
    ? `
      <div class="attached-docs-strip" id="docs-preview-strip">
        ${state.uploadedFiles.map(doc => `
          <div class="doc-badge" data-doc-id="${doc.id}">
            <i class="fa-solid ${doc.isPdf ? 'fa-file-pdf' : 'fa-file-lines'}"></i>
            <span class="doc-name">${escapeHtml(doc.name)}</span>
            <button type="button" class="btn-remove-doc" data-doc-id="${doc.id}" title="Remove document" aria-label="Remove file">&times;</button>
          </div>
        `).join('')}
      </div>
    `
    : '';

  return `
    <div class="input-panel-wrapper" id="input-panel-section">
      <!-- Domain Lens Selector Bar -->
      <div class="domain-lens-bar">
        <div class="lens-info">
          <span class="lens-label">Active Lens:</span>
          <div class="lens-pill active-lens-pill">
            <i class="${activeLens.icon}"></i>
            <strong>${activeLens.name}</strong>
            <span class="lens-status">${activeLens.badge}</span>
          </div>
        </div>
        <div class="lens-expansion-links">
          <span class="lens-future-tag" title="Civic and Disaster lenses are architected and ready for expansion">
            <i class="fa-solid fa-layer-group"></i> Civic / Disaster Lenses (Architecture Ready)
          </span>
        </div>
      </div>

      <!-- Demo Scenarios Section -->
      <div class="scenarios-container">
        <div class="scenarios-header">
          <div class="scenarios-title">
            <i class="fa-solid fa-play"></i>
            <span>1-Click Test Scenarios (Synthetic Demo Data)</span>
          </div>
          <small class="scenarios-subtitle">Click any scenario to pre-populate realistic messy notes and documents:</small>
        </div>
        <div class="scenarios-grid">
          ${scenariosHtml}
        </div>
      </div>

      <!-- Main Input Card -->
      <div class="input-card">
        <div class="input-card-header">
          <div class="header-title-group">
            <h3><i class="fa-solid fa-notes-medical"></i> Combine Your Inputs Here</h3>
            <span class="header-subtitle">Mix handwritten prescriptions, lab reports, photos, and voice notes into one submission.</span>
          </div>
          <button type="button" class="btn-clear-all" id="btn-clear-all-inputs" title="Clear all inputs from memory">
            <i class="fa-solid fa-rotate-left"></i>
            <span>Clear Everything</span>
          </button>
        </div>

        <div class="input-card-body">
          <!-- Text Input with Voice Controls -->
          <div class="text-input-group">
            <div class="text-input-header">
              <label for="raw-notes-input"><strong>Symptom Notes, Transcripts, or Pasted Details:</strong></label>
              
              <!-- Voice Recognition Bar -->
              <div class="voice-controls-bar">
                ${isSpeechSupported ? `
                  <div class="voice-lang-picker">
                    <label for="voice-lang-select"><small>Voice Language:</small></label>
                    <select id="voice-lang-select" class="select-sm" aria-label="Voice input language">
                      <option value="en-IN" ${state.speechLanguage === 'en-IN' ? 'selected' : ''}>English (India)</option>
                      <option value="hi-IN" ${state.speechLanguage === 'hi-IN' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                      <option value="mr-IN" ${state.speechLanguage === 'mr-IN' ? 'selected' : ''}>मराठी (Marathi)</option>
                    </select>
                  </div>
                  <button type="button" class="btn-voice-record" id="btn-voice-input" aria-label="Start voice dictation" title="Speak to add notes">
                    <i class="fa-solid fa-microphone" id="mic-icon"></i>
                    <span id="voice-btn-label">Voice Note</span>
                  </button>
                ` : `
                  <div class="voice-unsupported-note" title="Web Speech API is not supported in this browser. Use text box directly.">
                    <i class="fa-solid fa-microphone-slash"></i>
                    <small>Voice dictation not supported in browser</small>
                  </div>
                `}
              </div>
            </div>

            <textarea 
              id="raw-notes-input" 
              class="notes-textarea" 
              rows="5" 
              placeholder="Paste doctor notes, describe what the patient is feeling, paste WhatsApp caregiver transcripts, or dictate via microphone..."
              aria-label="Medical notes and symptoms input"
            >${escapeHtml(state.rawText)}</textarea>

            <div id="voice-interim-preview" class="voice-interim-box" style="display: none;">
              <span class="pulse-dot"></span>
              <span id="voice-interim-text">Listening...</span>
            </div>
          </div>

          <!-- Attachments Section (Images, Camera & Files) -->
          <div class="attachments-group">
            <label class="attachments-label"><strong>Photos, Prescriptions, Reports & Files:</strong></label>
            
            <div class="upload-dropzone" id="file-dropzone">
              <input 
                type="file" 
                id="file-input-photos" 
                multiple 
                accept="image/*" 
                capture="environment" 
                style="display: none;" 
              />
              <input 
                type="file" 
                id="file-input-documents" 
                multiple 
                accept=".pdf,.txt,.csv" 
                style="display: none;" 
              />

              <div class="dropzone-content">
                <div class="dropzone-buttons">
                  <button type="button" class="btn-attach" id="btn-trigger-camera">
                    <i class="fa-solid fa-camera"></i>
                    <span>Take Photo / Add Prescription</span>
                  </button>
                  <button type="button" class="btn-attach btn-attach-doc" id="btn-trigger-doc">
                    <i class="fa-solid fa-file-arrow-up"></i>
                    <span>Attach Lab PDF / Report</span>
                  </button>
                </div>
                <div class="dropzone-hint">
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Images are automatically compressed client-side before sending to Gemini Flash.</span>
                </div>
              </div>
            </div>

            <!-- Previews -->
            ${imageThumbnailsHtml}
            ${docThumbnailsHtml}
          </div>

          <!-- Output Settings Strip -->
          <div class="output-settings-strip">
            <div class="output-lang-selector">
              <label for="output-lang-select">
                <i class="fa-solid fa-language"></i>
                <strong>Explain Plan In:</strong>
              </label>
              <select id="output-lang-select" class="select-output-lang" aria-label="Select explanation language">
                <option value="English" ${state.outputLanguage === 'English' ? 'selected' : ''}>English (Simple Grade 6)</option>
                <option value="हिन्दी" ${state.outputLanguage === 'हिन्दी' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                <option value="मराठी" ${state.outputLanguage === 'मराठी' ? 'selected' : ''}>मराठी (Marathi)</option>
              </select>
              <small class="lang-hint">Clinical drug names & lab units remain in standard format.</small>
            </div>
          </div>

          <!-- Action & Privacy Bar -->
          <div class="action-submit-bar">
            <button 
              type="button" 
              class="btn-analyze-primary" 
              id="btn-run-analysis"
              ${state.isAnalyzing ? 'disabled' : ''}
              aria-label="Analyze with HelpBridge Two-Pass Pipeline"
            >
              <i class="fa-solid fa-shield-halved"></i>
              <span><strong>Analyze & Verify with HelpBridge</strong></span>
            </button>

            <div class="privacy-notice-strip">
              <i class="fa-solid fa-lock"></i>
              <span><strong>Privacy Guarantee:</strong> Memory-only synthesis. No accounts, no server databases. Data is sent to Google Gemini API for clinical analysis. Do not upload national ID cards or sensitive financial docs.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachInputPanelEvents(handlers) {
  const { onAnalyze, onClear, onScenarioSelect, onFilesAdded, onImagesAdded, onRemoveImage, onRemoveDoc } = handlers;

  // Scenario Buttons
  const scenarioBtns = document.querySelectorAll('.scenario-card-btn');
  scenarioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scenarioId = btn.dataset.scenarioId;
      onScenarioSelect(scenarioId);
    });
  });

  // Textarea input sync
  const textarea = document.getElementById('raw-notes-input');
  if (textarea) {
    textarea.addEventListener('input', (e) => {
      store.setState({ rawText: e.target.value });
    });
  }

  // Clear button
  const clearBtn = document.getElementById('btn-clear-all-inputs');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all inputs and reset memory?')) {
        onClear();
      }
    });
  }

  // Output language select
  const langSelect = document.getElementById('output-lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      store.setState({ outputLanguage: e.target.value });
    });
  }

  // Voice language select
  const voiceLangSelect = document.getElementById('voice-lang-select');
  if (voiceLangSelect) {
    voiceLangSelect.addEventListener('change', (e) => {
      store.setState({ speechLanguage: e.target.value });
    });
  }

  // Voice recording toggle
  const voiceBtn = document.getElementById('btn-voice-input');
  const micIcon = document.getElementById('mic-icon');
  const voiceLabel = document.getElementById('voice-btn-label');
  const interimPreview = document.getElementById('voice-interim-preview');
  const interimText = document.getElementById('voice-interim-text');

  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (speechService.isListening) {
        speechService.stopListening();
        updateVoiceButtonState(false);
      } else {
        const lang = voiceLangSelect ? voiceLangSelect.value : 'en-IN';
        updateVoiceButtonState(true);

        speechService.startListening({
          lang,
          onResult: ({ finalTranscript, interimTranscript }) => {
            if (interimPreview && interimText) {
              interimPreview.style.display = 'flex';
              interimText.textContent = interimTranscript || 'Listening...';
            }
            if (finalTranscript) {
              const currentText = textarea ? textarea.value : '';
              const separator = currentText && !currentText.endsWith('\n') ? '\n' : '';
              const updatedText = currentText + separator + finalTranscript.trim() + ' ';
              if (textarea) textarea.value = updatedText;
              store.setState({ rawText: updatedText });
            }
          },
          onError: (err) => {
            console.warn('Speech error:', err);
            updateVoiceButtonState(false);
          },
          onEnd: () => {
            updateVoiceButtonState(false);
          }
        });
      }
    });

    function updateVoiceButtonState(listening) {
      if (listening) {
        voiceBtn.classList.add('is-recording');
        micIcon.className = 'fa-solid fa-microphone-lines pulse-animation';
        voiceLabel.textContent = 'Listening...';
        if (interimPreview) interimPreview.style.display = 'flex';
      } else {
        voiceBtn.classList.remove('is-recording');
        micIcon.className = 'fa-solid fa-microphone';
        voiceLabel.textContent = 'Voice Note';
        if (interimPreview) interimPreview.style.display = 'none';
      }
    }
  }

  // File & Camera upload triggers
  const photoInput = document.getElementById('file-input-photos');
  const docInput = document.getElementById('file-input-documents');
  const btnCamera = document.getElementById('btn-trigger-camera');
  const btnDoc = document.getElementById('btn-trigger-doc');

  if (btnCamera && photoInput) {
    btnCamera.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        const processedImages = [];
        for (const f of files) {
          try {
            const imgData = await processImageFile(f);
            processedImages.push(imgData);
          } catch (err) {
            alert(`Could not process image: ${err.message}`);
          }
        }
        if (processedImages.length > 0) {
          onImagesAdded(processedImages);
        }
      }
      photoInput.value = '';
    });
  }

  if (btnDoc && docInput) {
    btnDoc.addEventListener('click', () => docInput.click());
    docInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        const processedDocs = [];
        for (const f of files) {
          try {
            const docData = await processDocumentFile(f);
            processedDocs.push(docData);
          } catch (err) {
            alert(`Could not process file: ${err.message}`);
          }
        }
        if (processedDocs.length > 0) {
          onFilesAdded(processedDocs);
        }
      }
      docInput.value = '';
    });
  }

  // Remove thumbnail events
  const previewStrip = document.getElementById('images-preview-strip');
  if (previewStrip) {
    previewStrip.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.btn-remove-thumb');
      if (removeBtn) {
        const imgId = removeBtn.dataset.imgId;
        onRemoveImage(imgId);
      }
    });
  }

  const docsStrip = document.getElementById('docs-preview-strip');
  if (docsStrip) {
    docsStrip.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.btn-remove-doc');
      if (removeBtn) {
        const docId = removeBtn.dataset.docId;
        onRemoveDoc(docId);
      }
    });
  }

  // Analyze Button
  const analyzeBtn = document.getElementById('btn-run-analysis');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      onAnalyze();
    });
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
