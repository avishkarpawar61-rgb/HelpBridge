/**
 * Urgency Banner Component
 * Handles critical emergency triage, full-width red emergency banners,
 * one-tap call buttons for 112 & 108, and supportive mental health helplines.
 */

export function renderUrgencyBanner(urgency, outputLanguage = 'English') {
  if (!urgency) return '';

  const isEmergency = urgency.level === 'EMERGENCY' || (urgency.red_flags && urgency.red_flags.length > 0);
  const isUrgent24h = urgency.level === 'URGENT_24H';
  const isSoon = urgency.level === 'SOON_THIS_WEEK';
  const isRoutine = urgency.level === 'ROUTINE';
  const isInsufficient = urgency.level === 'INSUFFICIENT_INFO';

  // Check if self-harm was flagged
  const hasSelfHarm = urgency.red_flags?.some(rf => 
    rf.toLowerCase().includes('suicid') || rf.toLowerCase().includes('self-harm') || rf.toLowerCase().includes('mental health')
  );

  let bannerClass = 'urgency-banner';
  let badgeText = 'Clinical Triage Evaluation';
  let icon = 'fa-solid fa-triangle-exclamation';

  if (isEmergency) {
    bannerClass += ' urgency-emergency';
    badgeText = 'CRITICAL EMERGENCY — IMMEDIATE MEDICAL ATTENTION REQUIRED';
    icon = 'fa-solid fa-truck-medical';
  } else if (isUrgent24h) {
    bannerClass += ' urgency-urgent24h';
    badgeText = 'URGENT CARE — SEE A DOCTOR WITHIN 24 HOURS';
    icon = 'fa-solid fa-clock';
  } else if (isSoon) {
    bannerClass += ' urgency-soon';
    badgeText = 'CONSULTATION RECOMMENDED THIS WEEK';
    icon = 'fa-solid fa-calendar-check';
  } else if (isRoutine) {
    bannerClass += ' urgency-routine';
    badgeText = 'ROUTINE CARE / HOME MONITORING';
    icon = 'fa-solid fa-circle-check';
  } else {
    bannerClass += ' urgency-insufficient';
    badgeText = 'INSUFFICIENT INFORMATION FOR TRIAGE';
    icon = 'fa-solid fa-circle-question';
  }

  const redFlagsHtml = (urgency.red_flags && urgency.red_flags.length > 0)
    ? `
      <div class="red-flags-box" role="alert">
        <div class="red-flags-title">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <strong>Critical Red Flags Detected:</strong>
        </div>
        <ul class="red-flags-list">
          ${urgency.red_flags.map(rf => `<li><span class="pulse-dot"></span>${escapeHtml(rf)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const emergencyActionsHtml = isEmergency
    ? `
      <div class="emergency-call-strip">
        <div class="call-prompt">
          <i class="fa-solid fa-phone-volume"></i>
          <span>Tap to connect immediately with emergency response services:</span>
        </div>
        <div class="call-buttons-group">
          <a href="tel:112" class="btn-emergency btn-112" id="call-112-btn" aria-label="Call National Emergency 112">
            <i class="fa-solid fa-phone"></i>
            <span><strong>Call 112</strong> (National Emergency)</span>
          </a>
          <a href="tel:108" class="btn-emergency btn-108" id="call-108-btn" aria-label="Call Ambulance 108">
            <i class="fa-solid fa-truck-medical"></i>
            <span><strong>Call 108</strong> (Ambulance)</span>
          </a>
        </div>
      </div>
    `
    : '';

  const selfHarmHelpHtml = hasSelfHarm
    ? `
      <div class="helpline-card" role="region" aria-label="Mental Health Support">
        <div class="helpline-header">
          <i class="fa-solid fa-heart-pulse"></i>
          <strong>You are not alone. Free, confidential support is available 24/7:</strong>
        </div>
        <div class="helpline-links">
          <a href="tel:14416" class="helpline-badge">
            <i class="fa-solid fa-phone"></i> <strong>Tele-MANAS</strong>: Call 14416 (Govt of India, Toll-Free)
          </a>
          <a href="tel:18005990019" class="helpline-badge">
            <i class="fa-solid fa-phone"></i> <strong>KIRAN Helpline</strong>: 1800-599-0019
          </a>
        </div>
      </div>
    `
    : '';

  return `
    <section class="${bannerClass}" id="urgency-banner-section" aria-live="polite">
      <div class="urgency-header">
        <div class="urgency-badge">
          <i class="${icon}"></i>
          <span>${badgeText}</span>
        </div>
      </div>
      <div class="urgency-body">
        <p class="urgency-rationale">${escapeHtml(urgency.rationale || '')}</p>
        ${redFlagsHtml}
        ${emergencyActionsHtml}
        ${selfHarmHelpHtml}
      </div>
    </section>
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
