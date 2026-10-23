/**
 * About Modal Component
 * Outlines the Societal Benefit mission, target audience, Gemini architecture,
 * responsible AI boundaries, and future domain lens roadmaps.
 */

export function renderAboutModal() {
  return `
    <div class="modal-backdrop" id="about-info-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
      <div class="modal-card modal-lg">
        <div class="modal-header">
          <div class="header-with-badge">
            <h2 id="about-modal-title">
              <i class="fa-solid fa-heart-pulse"></i> About HelpBridge AI
            </h2>
            <span class="badge badge-accent">PromptWars Hackathon — Societal Benefit</span>
          </div>
          <button type="button" class="btn-close-modal" id="close-about-modal-btn" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body about-modal-body">
          <!-- Section 1: The Problem -->
          <div class="about-section">
            <h3><i class="fa-solid fa-triangle-exclamation"></i> The Problem: Real-World Healthcare is Chaotic</h3>
            <p>
              When a family member falls sick, caregivers are overwhelmed with a confusing, fragmented pile of inputs:
              illegible handwritten prescriptions from busy clinics, screenshot lab reports with unfamiliar numbers,
              discharge summaries, and anxious voice messages in regional languages. Stressed families often don't know:
              <strong>(1) what is actually happening</strong>, <strong>(2) whether it is an emergency</strong>, or <strong>(3) what action to take first</strong>.
            </p>
          </div>

          <!-- Section 2: Who It Helps -->
          <div class="about-section">
            <h3><i class="fa-solid fa-users-line"></i> Who It Helps</h3>
            <div class="audience-grid">
              <div class="audience-card">
                <i class="fa-solid fa-person-cane"></i>
                <strong>Elderly & Polypharmacy Patients</strong>
                <span>Confused by multiple pills, blurry doses, and forgotten schedules.</span>
              </div>
              <div class="audience-card">
                <i class="fa-solid fa-hands-holding-child"></i>
                <strong>Stressed Caregivers & Parents</strong>
                <span>Managing high fever, pediatric rashes, or sudden symptoms during midnight emergencies.</span>
              </div>
              <div class="audience-card">
                <i class="fa-solid fa-language"></i>
                <strong>Regional Language Speakers</strong>
                <span>Receiving clear Grade-6 explanations in Hindi or Marathi while keeping medical drug names intact.</span>
              </div>
              <div class="audience-card">
                <i class="fa-solid fa-user-doctor"></i>
                <strong>ER Doctors & Paramedics</strong>
                <span>Getting a clean 20-second Emergency Handoff Card instead of reading 15 pages of messy papers.</span>
              </div>
            </div>
          </div>

          <!-- Section 3: Gemini Architecture -->
          <div class="about-section">
            <h3><i class="fa-solid fa-microchip"></i> How Gemini is Leveraged</h3>
            <ul class="gemini-tech-list">
              <li>
                <strong>Multimodal Flash Vision:</strong> Reads raw handwritten prescriptions, clinic slips, and diagnostic reports natively via base64 image parts.
              </li>
              <li>
                <strong>Rigid JSON Schemas:</strong> Enforces clinical triage parameters, medication verification tables, and emergency handoffs without arbitrary hallucinated keys.
              </li>
              <li>
                <strong>Two-Pass Verification Pipeline:</strong>
                Pass 1 extracts clinical facts and formulates an action plan.
                Pass 2 deploys an adversarial auditor that cross-examines Pass 1 against the raw image and text evidence, flagging discrepancies and assigning an objective 0-100 reliability score.
              </li>
              <li>
                <strong>Multilingual Synthesis:</strong> Converts complex clinical findings into accessible Grade-6 explanations in English, हिन्दी, and मराठी.
              </li>
            </ul>
          </div>

          <!-- Section 4: Responsible AI & Safety Guardrails -->
          <div class="about-section alert-section">
            <h3><i class="fa-solid fa-shield-halved"></i> Responsible AI & Privacy Guarantees</h3>
            <p>
              HelpBridge is <strong>strictly a triage synthesis tool, not a doctor</strong>. It never prescribes medications or issues definitive diagnoses.
              Zero user data is persisted on server databases (memory only). When red-flag symptoms are identified, prominent one-tap 112/108 call buttons take priority over all text.
            </p>
          </div>

          <!-- Section 5: Expansion Roadmap -->
          <div class="about-section">
            <h3><i class="fa-solid fa-road"></i> Domain Lens Expansion Roadmap</h3>
            <p>HelpBridge is architected around pluggable domain lenses:</p>
            <div class="roadmap-grid">
              <div class="roadmap-card active">
                <span class="status-tag active">Currently Active</span>
                <strong>Healthcare Lens</strong>
                <span>Prescriptions, symptoms, lab reports → Verified Care Plan & ER Handoff</span>
              </div>
              <div class="roadmap-card">
                <span class="status-tag">Coming Soon</span>
                <strong>Civic Infrastructure Lens</strong>
                <span>Pothole photos, sewage complaints → Ward Officer Grievance Dossier</span>
              </div>
              <div class="roadmap-card">
                <span class="status-tag">Coming Soon</span>
                <strong>Disaster Response Lens</strong>
                <span>Flood reports, trapped citizens → NDRF Rescue Manifest</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-primary" id="close-about-btn-footer">Got It</button>
        </div>
      </div>
    </div>
  `;
}

export function attachAboutModalEvents() {
  const modal = document.getElementById('about-info-modal');
  const openBtn = document.getElementById('btn-open-about');
  const closeBtn = document.getElementById('close-about-modal-btn');
  const footerCloseBtn = document.getElementById('close-about-btn-footer');

  if (modal && !modal.dataset.bound) {
    modal.dataset.bound = 'true';

    if (openBtn) {
      openBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    }

    [closeBtn, footerCloseBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => { modal.style.display = 'none'; });
      }
    });

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
