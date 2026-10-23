/**
 * API Key & Settings Modal Component
 * Lets the user configure their Google AI Studio Gemini API Key and Model choice.
 */

import { store } from '../services/storage.js';
import { GEMINI_MODELS, selectedModel, setSelectedModel } from '../services/gemini.js';

export function renderApiKeyModal() {
  const currentKey = store.getApiKey();
  const maskedKey = currentKey ? currentKey.substring(0, 6) + '••••••••••••' + currentKey.slice(-4) : '';

  const modelOptions = GEMINI_MODELS.map(m => {
    return `<option value="${m.id}" ${m.id === selectedModel ? 'selected' : ''}>${m.name}</option>`;
  }).join('');

  return `
    <div class="modal-backdrop" id="api-key-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="api-modal-title">
      <div class="modal-card">
        <div class="modal-header">
          <h3 id="api-modal-title"><i class="fa-solid fa-key"></i> Gemini API Settings</h3>
          <button type="button" class="btn-close-modal" id="close-api-modal-btn" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">
            HelpBridge AI uses real Google Gemini API calls (no canned analysis).
            Your key remains exclusively in your browser memory and is transmitted directly to Google's API endpoints.
          </p>

          <div class="form-group">
            <label for="gemini-key-input"><strong>Google AI Studio API Key:</strong></label>
            <div class="input-with-button">
              <input 
                type="password" 
                id="gemini-key-input" 
                class="form-control" 
                placeholder="AIzaSy..." 
                value="${currentKey}"
                autocomplete="off"
              />
              <button type="button" class="btn-toggle-pw" id="btn-toggle-key-visibility" title="Show/Hide Key">
                <i class="fa-regular fa-eye" id="eye-icon"></i>
              </button>
            </div>
            <small class="form-hint">
              Need a key? Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
            </small>
          </div>

          <div class="form-group">
            <label for="gemini-model-select"><strong>Model Engine:</strong></label>
            <select id="gemini-model-select" class="form-control">
              ${modelOptions}
            </select>
            <small class="form-hint">Gemini 2.5 Flash is recommended for multimodal visual speed and accuracy.</small>
          </div>

          <div class="checkbox-group">
            <label class="checkbox-label" for="persist-key-cb">
              <input type="checkbox" id="persist-key-cb" checked />
              <span>Remember key in this browser session</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" id="cancel-api-key-btn">Cancel</button>
          <button type="button" class="btn-primary" id="save-api-key-btn">Save Key</button>
        </div>
      </div>
    </div>
  `;
}

export function attachApiKeyModalEvents(onKeyUpdated) {
  const modal = document.getElementById('api-key-modal');
  const openBtn = document.getElementById('btn-open-api-modal');
  const closeBtn = document.getElementById('close-api-modal-btn');
  const cancelBtn = document.getElementById('cancel-api-key-btn');
  const saveBtn = document.getElementById('save-api-key-btn');
  const keyInput = document.getElementById('gemini-key-input');
  const modelSelect = document.getElementById('gemini-model-select');
  const toggleVisibilityBtn = document.getElementById('btn-toggle-key-visibility');
  const eyeIcon = document.getElementById('eye-icon');
  const persistCb = document.getElementById('persist-key-cb');

  if (modal && !modal.dataset.bound) {
    modal.dataset.bound = 'true';

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        if (keyInput) keyInput.value = store.getApiKey();
        modal.style.display = 'flex';
      });
    }

    [closeBtn, cancelBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => { modal.style.display = 'none'; });
      }
    });

    if (toggleVisibilityBtn && keyInput && eyeIcon) {
      toggleVisibilityBtn.addEventListener('click', () => {
        const isPassword = keyInput.type === 'password';
        keyInput.type = isPassword ? 'text' : 'password';
        eyeIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
      });
    }

    if (saveBtn && keyInput) {
      saveBtn.addEventListener('click', () => {
        const newKey = keyInput.value.trim();
        const shouldPersist = persistCb ? persistCb.checked : false;
        store.setApiKey(newKey, shouldPersist);

        if (modelSelect) {
          setSelectedModel(modelSelect.value);
        }

        modal.style.display = 'none';
        if (onKeyUpdated) onKeyUpdated(newKey);
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') {
        modal.style.display = 'none';
      }
    });
  }
}
