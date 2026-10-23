/**
 * Emergency Handoff Card Component (20-Second ER Summary)
 * Designed for immediate paramedic / ER nurse / physician review.
 * Includes Print / Save as PDF, Copy Text, and Web Share API integrations.
 */

export function renderEmergencyCard(emergencyCardData, urgencyLevel = 'ROUTINE') {
  if (!emergencyCardData) return '';

  const {
    patient_descriptor = 'Patient',
    key_conditions = [],
    current_medications = [],
    allergies = [],
    recent_findings = [],
    what_happened = '',
    suggested_attention_level = urgencyLevel
  } = emergencyCardData;

  const isEmergency = suggested_attention_level === 'EMERGENCY' || urgencyLevel === 'EMERGENCY';

  return `
    <div class="result-card emergency-handoff-container" id="emergency-handoff-section">
      <div class="card-header no-print">
        <div class="card-title">
          <i class="fa-solid fa-id-card-clip"></i>
          <span>Emergency Handoff Card (20-Second Clinical Triage)</span>
        </div>
        <div class="handoff-actions">
          <button type="button" class="btn-handoff btn-print" id="print-card-btn" title="Print or Save as 1-Page PDF">
            <i class="fa-solid fa-print"></i>
            <span>Print / Save PDF</span>
          </button>
          <button type="button" class="btn-handoff btn-copy-card" id="copy-card-btn" title="Copy clean summary text">
            <i class="fa-regular fa-copy"></i>
            <span id="copy-card-text">Copy Text</span>
          </button>
          <button type="button" class="btn-handoff btn-share-card" id="share-card-btn" title="Share via Mobile Share Sheet">
            <i class="fa-solid fa-share-nodes"></i>
            <span>Share</span>
          </button>
        </div>
      </div>

      <!-- Printable Emergency Document -->
      <div class="emergency-handoff-card ${isEmergency ? 'card-emergency-border' : ''}" id="printable-emergency-card">
        <!-- Print Header -->
        <div class="card-print-header">
          <div class="print-brand">
            <i class="fa-solid fa-staff-snake"></i>
            <strong>HELPBRIDGE CLINICAL EMERGENCY HANDOFF</strong>
          </div>
          <div class="print-meta">
            <span>Generated: ${new Date().toLocaleString()}</span>
            <span class="attention-badge ${isEmergency ? 'badge-emergency' : ''}">
              Attention: ${escapeHtml(suggested_attention_level)}
            </span>
          </div>
        </div>

        <!-- Grid Layout for 20-Sec Quick Read -->
        <div class="handoff-grid">
          <!-- Row 1: Patient & Acute Incident -->
          <div class="grid-cell cell-full">
            <span class="cell-label">PATIENT IDENTIFIER & CHIEF COMPLAINT (WHAT HAPPENED):</span>
            <div class="cell-highlight">
              <strong>${escapeHtml(patient_descriptor)}</strong> — ${escapeHtml(what_happened || 'See attached notes')}
            </div>
          </div>

          <!-- Row 2: Conditions & Allergies -->
          <div class="grid-cell cell-half">
            <span class="cell-label">KNOWN CONDITIONS:</span>
            <ul class="handoff-pill-list">
              ${key_conditions.length > 0
                ? key_conditions.map(c => `<li>${escapeHtml(c)}</li>`).join('')
                : '<li>None reported</li>'}
            </ul>
          </div>

          <div class="grid-cell cell-half cell-allergies">
            <span class="cell-label"><i class="fa-solid fa-triangle-exclamation"></i> ALLERGIES / CONTRAINDICATIONS:</span>
            <ul class="handoff-pill-list allergy-pills">
              ${allergies.length > 0
                ? allergies.map(a => `<li class="pill-allergy">${escapeHtml(a)}</li>`).join('')
                : '<li>No known allergies documented</li>'}
            </ul>
          </div>

          <!-- Row 3: Current Medications -->
          <div class="grid-cell cell-full">
            <span class="cell-label">CURRENT MEDICATIONS & REPORTED SCHEDULE:</span>
            <ul class="handoff-meds-list">
              ${current_medications.length > 0
                ? current_medications.map(m => `<li><i class="fa-solid fa-capsules"></i> ${escapeHtml(m)}</li>`).join('')
                : '<li>No active medications documented</li>'}
            </ul>
          </div>

          <!-- Row 4: Recent Vitals & Abnormal Findings -->
          <div class="grid-cell cell-full">
            <span class="cell-label">RECENT ABNORMAL FINDINGS & LAB EVIDENCE:</span>
            <ul class="handoff-findings-list">
              ${recent_findings.length > 0
                ? recent_findings.map(f => `<li><i class="fa-solid fa-chart-simple"></i> ${escapeHtml(f)}</li>`).join('')
                : '<li>None recorded</li>'}
            </ul>
          </div>
        </div>

        <div class="handoff-footer">
          <small>HelpBridge AI Synthesis. Synthesized for triage assistance only. Doctor/Paramedic must clinically re-verify all medications & dosages.</small>
        </div>
      </div>
    </div>
  `;
}

export function attachEmergencyCardEvents(cardData, urgencyLevel) {
  const printBtn = document.getElementById('print-card-btn');
  const copyBtn = document.getElementById('copy-card-btn');
  const copyText = document.getElementById('copy-card-text');
  const shareBtn = document.getElementById('share-card-btn');

  if (printBtn && printBtn.dataset.bound) return;
  if (printBtn) printBtn.dataset.bound = 'true';

  const textSummary = generateTextSummary(cardData, urgencyLevel);

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textSummary);
        if (copyText) {
          copyText.textContent = 'Copied!';
          setTimeout(() => { copyText.textContent = 'Copy Text'; }, 2000);
        }
      } catch (err) {
        console.warn('Clipboard copy error:', err);
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `HelpBridge Emergency Handoff — ${cardData.patient_descriptor || 'Patient'}`,
            text: textSummary
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyToClipboardFallback(textSummary);
          }
        }
      } else {
        copyToClipboardFallback(textSummary);
      }
    });
  }

  function copyToClipboardFallback(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Emergency card copied to clipboard for easy messaging/sharing!');
    });
  }
}

function generateTextSummary(data, urgencyLevel) {
  if (!data) return '';
  return `=== HELPBRIDGE EMERGENCY HANDOFF CARD (20-SEC SUMMARY) ===
Attention Level: ${data.suggested_attention_level || urgencyLevel}
Patient: ${data.patient_descriptor || 'Patient'}
Incident / What Happened: ${data.what_happened || 'N/A'}

Key Conditions:
${(data.key_conditions || []).map(c => `• ${c}`).join('\n') || 'None reported'}

Allergies:
${(data.allergies || []).map(a => `• ${a}`).join('\n') || 'None reported'}

Current Medications:
${(data.current_medications || []).map(m => `• ${m}`).join('\n') || 'None reported'}

Recent Findings / Vitals:
${(data.recent_findings || []).map(f => `• ${f}`).join('\n') || 'None recorded'}

Generated by HelpBridge AI for emergency triage handoff.`;
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
