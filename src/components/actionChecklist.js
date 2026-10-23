/**
 * Action Checklist Component
 * Interactive prioritized action plan with tickable completion states.
 */

import { store } from '../services/storage.js';

export function renderActionChecklist(actions = [], completedSet = new Set()) {
  if (!actions || actions.length === 0) return '';

  const itemsHtml = actions.map((act, index) => {
    const isCompleted = completedSet.has(index);
    const priorityBadge = act.priority === 1
      ? '<span class="action-tag tag-urgent">Priority 1 (Immediate)</span>'
      : `<span class="action-tag">Step ${act.priority || index + 1}</span>`;

    let whoIcon = 'fa-user';
    let whoLabel = 'You / Self';
    if (act.who === 'caregiver') { whoIcon = 'fa-hands-holding-child'; whoLabel = 'Caregiver'; }
    else if (act.who === 'doctor') { whoIcon = 'fa-user-doctor'; whoLabel = 'Doctor / Specialist'; }
    else if (act.who === 'emergency_services') { whoIcon = 'fa-truck-medical'; whoLabel = 'Emergency Response (112/108)'; }

    return `
      <li class="action-item ${isCompleted ? 'action-completed' : ''}" data-index="${index}">
        <label class="action-checkbox-wrapper" for="action-cb-${index}">
          <input 
            type="checkbox" 
            id="action-cb-${index}" 
            class="action-checkbox" 
            data-index="${index}" 
            ${isCompleted ? 'checked' : ''}
            aria-label="Mark action step ${index + 1} complete"
          />
          <span class="custom-checkmark"></span>
        </label>
        <div class="action-content">
          <div class="action-top">
            ${priorityBadge}
            <span class="action-who">
              <i class="fa-solid ${whoIcon}"></i> ${escapeHtml(whoLabel)}
            </span>
            <span class="action-timeframe">
              <i class="fa-regular fa-clock"></i> ${escapeHtml(act.timeframe || 'Immediate')}
            </span>
          </div>
          <p class="action-step-text">${escapeHtml(act.step)}</p>
          ${act.why ? `<p class="action-why"><strong>Why:</strong> ${escapeHtml(act.why)}</p>` : ''}
        </div>
      </li>
    `;
  }).join('');

  return `
    <div class="result-card action-card" id="action-checklist-section">
      <div class="card-header">
        <div class="card-title">
          <i class="fa-solid fa-list-check"></i>
          <span>What To Do Next (Your Action Checklist)</span>
        </div>
        <div class="checklist-progress">
          <span id="checklist-counter">${completedSet.size} of ${actions.length} Completed</span>
        </div>
      </div>
      <div class="card-body">
        <ul class="action-list" id="action-items-list">
          ${itemsHtml}
        </ul>
      </div>
    </div>
  `;
}

export function attachActionChecklistEvents() {
  const list = document.getElementById('action-items-list');
  if (!list || list.dataset.bound) return;
  list.dataset.bound = 'true';

  list.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('action-checkbox')) {
      const index = parseInt(e.target.dataset.index, 10);
      store.toggleActionComplete(index);
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
