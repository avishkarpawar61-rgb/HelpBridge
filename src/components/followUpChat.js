/**
 * Grounded Follow-Up Q&A Component ("Ask About This Plan")
 * Grounded strictly in the synthesized Care Plan JSON, respecting clinical safety limits.
 */

import { askFollowUpQuestion } from '../services/gemini.js';
import { store } from '../services/storage.js';

export function renderFollowUpChat(chatMessages = [], isLoading = false) {
  const suggestions = [
    "What should I ask my pharmacist?",
    "When should I go to the emergency room?",
    "Can any of these medications cause dizziness?",
    "What should the caregiver monitor tonight?"
  ];

  const suggestionsHtml = suggestions.map(s => {
    return `<button type="button" class="chat-suggestion-chip">${escapeHtml(s)}</button>`;
  }).join('');

  const messagesHtml = chatMessages.length === 0
    ? `
      <div class="chat-empty-state">
        <i class="fa-solid fa-comments"></i>
        <p>Have questions about this Care Plan? Ask below.</p>
        <small>Answers are grounded solely in the verified findings above and carry strict clinical safety guardrails.</small>
        <div class="chat-suggestions-box">
          <span class="suggestions-label">Try asking:</span>
          <div class="suggestions-chips-row" id="chat-suggestions-row">
            ${suggestionsHtml}
          </div>
        </div>
      </div>
    `
    : chatMessages.map(msg => {
      const isUser = msg.role === 'user';
      return `
        <div class="chat-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}">
          <div class="bubble-header">
            <i class="fa-solid ${isUser ? 'fa-user' : 'fa-staff-snake'}"></i>
            <span>${isUser ? 'You' : 'HelpBridge Care Assistant'}</span>
          </div>
          <div class="bubble-content">
            <p>${escapeHtml(msg.text)}</p>
          </div>
        </div>
      `;
    }).join('');

  return `
    <div class="result-card follow-up-card no-print" id="follow-up-chat-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-comments"></i>
          <span>Ask About This Plan (Grounded Q&A)</span>
        </div>
        <span class="badge badge-subtle"><i class="fa-solid fa-lock"></i> Context Grounded</span>
      </div>
      <div class="card-body">
        <div class="chat-messages-container" id="chat-messages-scroll">
          ${messagesHtml}
          ${isLoading ? `
            <div class="chat-bubble bubble-assistant bubble-loading">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Consulting verified Care Plan...</span>
            </div>
          ` : ''}
        </div>
        <form class="chat-input-form" id="follow-up-form">
          <input 
            type="text" 
            id="follow-up-input" 
            class="chat-input" 
            placeholder="Type your question about this care plan..." 
            autocomplete="off"
            ${isLoading ? 'disabled' : ''}
          />
          <button type="submit" class="btn-chat-send" id="btn-send-question" ${isLoading ? 'disabled' : ''}>
            <i class="fa-solid fa-paper-plane"></i>
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

export function attachFollowUpEvents(verifiedCarePlan) {
  const form = document.getElementById('follow-up-form');
  const input = document.getElementById('follow-up-input');
  const suggestionsRow = document.getElementById('chat-suggestions-row');

  if (suggestionsRow && !suggestionsRow.dataset.bound) {
    suggestionsRow.dataset.bound = 'true';
    suggestionsRow.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('chat-suggestion-chip')) {
        const text = e.target.textContent;
        if (input) {
          input.value = text;
          submitQuestion(text);
        }
      }
    });
  }

  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input ? input.value.trim() : '';
      if (!text) return;
      input.value = '';
      submitQuestion(text);
    });
  }

  async function submitQuestion(questionText) {
    const currentState = store.getState();
    const apiKey = store.getApiKey();

    if (!apiKey) {
      alert('Please set your Google AI Studio Gemini API Key to ask questions.');
      return;
    }

    const newMessages = [
      ...currentState.chatMessages,
      { role: 'user', text: questionText }
    ];

    store.setState({
      chatMessages: newMessages,
      isChatLoading: true
    });

    try {
      const response = await askFollowUpQuestion({
        apiKey,
        carePlan: verifiedCarePlan,
        chatHistory: currentState.chatMessages,
        userQuestion: questionText
      });

      store.setState({
        chatMessages: [
          ...newMessages,
          { role: 'model', text: response }
        ],
        isChatLoading: false
      });
    } catch (err) {
      store.setState({
        chatMessages: [
          ...newMessages,
          { role: 'model', text: `Error: ${err.message || 'Failed to process question. Please try again.'}` }
        ],
        isChatLoading: false
      });
    }

    // Scroll chat to bottom
    const scrollEl = document.getElementById('chat-messages-scroll');
    if (scrollEl) {
      setTimeout(() => { scrollEl.scrollTop = scrollEl.scrollHeight; }, 100);
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
