/**
 * Main Application Controller for HelpBridge AI
 * Connects reactive store, Gemini pipeline, speech services, and modular components.
 */

import { store } from './services/storage.js';
import { runHelpBridgePipeline } from './services/gemini.js';
import { DEMO_SCENARIOS } from './data/scenarios.js';
import { canvasToImageData } from './services/fileProcessor.js';

// Components
import { renderInputPanel, attachInputPanelEvents } from './components/inputPanel.js';
import { renderProgressIndicator } from './components/progressIndicator.js';
import { renderUrgencyBanner } from './components/urgencyBanner.js';
import { renderMetricsStrip } from './components/metricsStrip.js';
import { renderSummaryCard, attachSummaryEvents } from './components/summaryCard.js';
import { renderActionChecklist, attachActionChecklistEvents } from './components/actionChecklist.js';
import { renderFactsTable, attachFactsEvents } from './components/factsTable.js';
import { renderMedicationsCard } from './components/medicationsCard.js';
import { renderAbnormalCard } from './components/abnormalCard.js';
import { renderQuestionsCard, attachQuestionsEvents } from './components/questionsCard.js';
import { renderVerificationCard } from './components/verificationCard.js';
import { renderEmergencyCard, attachEmergencyCardEvents } from './components/emergencyCard.js';
import { renderBeforeAfterToggle, renderRawBeforePanel } from './components/beforeAfter.js';
import { renderFollowUpChat, attachFollowUpEvents } from './components/followUpChat.js';
import { renderAboutModal, attachAboutModalEvents } from './components/aboutModal.js';
import { renderApiKeyModal, attachApiKeyModalEvents } from './components/apiKeyModal.js';

class HelpBridgeApp {
  constructor() {
    this.factsFilter = 'all';
    this.init();
  }

  init() {
    // Initial mount
    this.render();

    // Subscribe to state changes
    store.subscribe(() => {
      this.render();
    });

    // Check for API key in URL query parameter (?key=AIzaSy...)
    const urlParams = new URLSearchParams(window.location.search);
    const queryKey = urlParams.get('key');
    if (queryKey) {
      store.setApiKey(queryKey, false);
    }
  }

  render() {
    const state = store.getState();
    const appContainer = document.getElementById('app-root');
    if (!appContainer) return;

    const apiKey = store.getApiKey();
    const hasKey = Boolean(apiKey);

    // Header HTML
    const headerHtml = `
      <header class="app-header no-print">
        <div class="header-inner">
          <div class="brand-group">
            <div class="brand-logo">
              <i class="fa-solid fa-staff-snake"></i>
            </div>
            <div class="brand-titles">
              <h1 class="brand-name">HelpBridge AI</h1>
              <p class="brand-tagline">From Problems to Action — Medical Triage & Verified Care Plan</p>
            </div>
            <span class="badge badge-hackathon">PromptWars Hackathon</span>
          </div>

          <div class="header-actions-group">
            <button 
              type="button" 
              class="btn-header-key ${hasKey ? 'key-connected' : 'key-missing'}" 
              id="btn-open-api-modal"
              title="${hasKey ? 'Gemini API Key Connected' : 'Set your Gemini API Key'}"
            >
              <span class="status-indicator-dot ${hasKey ? 'dot-active' : 'dot-alert'}"></span>
              <i class="fa-solid fa-key"></i>
              <span>${hasKey ? 'Gemini API Active' : 'Set Gemini API Key'}</span>
            </button>

            <button type="button" class="btn-header-about" id="btn-open-about" title="Learn about HelpBridge AI">
              <i class="fa-solid fa-circle-info"></i>
              <span>About & Roadmap</span>
            </button>
          </div>
        </div>
      </header>
    `;

    // Main Content Layout
    let resultsHtml = '';
    const hasResults = Boolean(state.verifiedCarePlan);

    if (state.isAnalyzing) {
      resultsHtml = `
        <div class="results-loading-state">
          ${renderProgressIndicator(state.currentStage, state.progressMessage)}
        </div>
      `;
    } else if (hasResults) {
      const plan = state.verifiedCarePlan;
      const urgency = plan.urgency;
      const metrics = state.metrics;

      const structuredPlanHtml = `
        <div class="structured-plan-flow">
          ${renderUrgencyBanner(urgency, state.outputLanguage)}
          ${renderMetricsStrip(metrics)}
          ${renderSummaryCard(plan.summary, plan.language_detected, state.outputLanguage)}
          ${renderActionChecklist(plan.actions, state.completedActionIds)}
          ${renderFactsTable(plan.facts, this.factsFilter)}
          ${renderMedicationsCard(plan.medications)}
          ${renderAbnormalCard(plan.abnormal_findings, plan.missing_information)}
          ${renderQuestionsCard(plan.questions_for_doctor)}
          ${renderVerificationCard(plan.auditor)}
          ${renderEmergencyCard(plan.emergency_card, urgency?.level)}
          ${renderFollowUpChat(state.chatMessages, state.isChatLoading)}
        </div>
      `;

      if (state.activeView === 'before') {
        resultsHtml = `
          <div class="results-wrapper">
            ${renderBeforeAfterToggle(state.activeView)}
            ${renderRawBeforePanel(state)}
          </div>
        `;
      } else if (state.activeView === 'split') {
        resultsHtml = `
          <div class="results-wrapper">
            ${renderBeforeAfterToggle(state.activeView)}
            <div class="split-demo-grid">
              <div class="split-column split-left">
                <div class="split-column-title"><i class="fa-solid fa-box-archive"></i> Messy Input (Raw Evidence)</div>
                ${renderRawBeforePanel(state)}
              </div>
              <div class="split-column split-right">
                <div class="split-column-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Structured & Verified Care Plan</div>
                ${structuredPlanHtml}
              </div>
            </div>
          </div>
        `;
      } else {
        // 'after'
        resultsHtml = `
          <div class="results-wrapper">
            ${renderBeforeAfterToggle(state.activeView)}
            ${structuredPlanHtml}
          </div>
        `;
      }
    } else {
      // Empty results welcome screen
      resultsHtml = `
        <div class="empty-welcome-card">
          <div class="welcome-icon">
            <i class="fa-solid fa-notes-medical"></i>
          </div>
          <h2>Ready to Transform Chaotic Health Records</h2>
          <p class="welcome-lead">
            Upload or snap photos of handwritten prescriptions, lab tests, type symptoms, or test with one of the 
            <strong>3 synthetic demo scenarios</strong> on the left.
          </p>
          <div class="welcome-features-row">
            <div class="welcome-feature">
              <i class="fa-solid fa-magnifying-glass-chart"></i>
              <strong>Multimodal Vision</strong>
              <span>Transcribes handwritten clinic slips and lab reports accurately.</span>
            </div>
            <div class="welcome-feature">
              <i class="fa-solid fa-shield-halved"></i>
              <strong>Two-Pass Verification</strong>
              <span>Pass 2 Lead Auditor checks claims against raw evidence for zero hallucinations.</span>
            </div>
            <div class="welcome-feature">
              <i class="fa-solid fa-id-card-clip"></i>
              <strong>20-Sec ER Card</strong>
              <span>Generates a printable, high-contrast emergency handoff card for doctors & paramedics.</span>
            </div>
          </div>
        </div>
      `;
    }

    // Persistent Footer
    const footerHtml = `
      <footer class="app-footer no-print">
        <div class="footer-inner">
          <div class="footer-disclaimer">
            <i class="fa-solid fa-shield-halved"></i>
            <span>
              <strong>NOT MEDICAL ADVICE:</strong> HelpBridge AI is an experimental AI synthesis tool created for the PromptWars hackathon. 
              Outputs are for triage assistance and caregiver understanding only. Always verify medications, dosages, and urgency with licensed medical doctors and pharmacists.
            </span>
          </div>
          <div class="footer-helpline-links">
            <span>Immediate Helplines: <strong>112</strong> (Emergency) | <strong>108</strong> (Ambulance) | <strong>14416</strong> (Tele-MANAS Mental Health)</span>
          </div>
        </div>
      </footer>
    `;

    // Complete Page Assembly
    appContainer.innerHTML = `
      ${headerHtml}
      <main class="main-content-layout">
        <div class="layout-grid">
          <aside class="layout-input-column no-print">
            ${renderInputPanel(state)}
          </aside>
          <section class="layout-results-column" id="results-container-panel">
            ${resultsHtml}
          </section>
        </div>
      </main>
      ${footerHtml}

      <!-- Modals -->
      ${renderAboutModal()}
      ${renderApiKeyModal()}
    `;

    // Attach Event Listeners
    this.attachEvents();
  }

  attachEvents() {
    const state = store.getState();

    // Input Panel Events
    attachInputPanelEvents({
      onAnalyze: () => this.handleRunAnalysis(),
      onClear: () => {
        store.clearAllMedicalData();
      },
      onScenarioSelect: (scenarioId) => this.handleScenarioSelect(scenarioId),
      onFilesAdded: (files) => {
        store.setState({ uploadedFiles: [...state.uploadedFiles, ...files] });
      },
      onImagesAdded: (images) => {
        store.setState({ images: [...state.images, ...images] });
      },
      onRemoveImage: (imgId) => {
        store.setState({ images: state.images.filter(img => img.id !== imgId) });
      },
      onRemoveDoc: (docId) => {
        store.setState({ uploadedFiles: state.uploadedFiles.filter(d => d.id !== docId) });
      }
    });

    // Modals
    attachAboutModalEvents();
    attachApiKeyModalEvents(() => {
      this.render();
    });

    // Before / After View Switcher
    const btnBefore = document.getElementById('btn-view-before');
    const btnSplit = document.getElementById('btn-view-split');
    const btnAfter = document.getElementById('btn-view-after');

    if (btnBefore) btnBefore.addEventListener('click', () => store.setState({ activeView: 'before' }));
    if (btnSplit) btnSplit.addEventListener('click', () => store.setState({ activeView: 'split' }));
    if (btnAfter) btnAfter.addEventListener('click', () => store.setState({ activeView: 'after' }));

    // Result Card Component Events (if rendered)
    if (state.verifiedCarePlan) {
      const plan = state.verifiedCarePlan;
      attachSummaryEvents(plan.summary, state.outputLanguage);
      attachActionChecklistEvents();
      attachFactsEvents(plan.facts, (newFilter) => {
        this.factsFilter = newFilter;
        this.render();
      });
      attachQuestionsEvents(plan.questions_for_doctor);
      attachEmergencyCardEvents(plan.emergency_card, plan.urgency?.level);
      attachFollowUpEvents(plan);
    }
  }

  handleScenarioSelect(scenarioId) {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    const newImages = [];
    if (scenario.hasPrescriptionImage && scenario.generateImage) {
      const canvas = scenario.generateImage();
      const imgData = canvasToImageData(canvas, scenario.imageFilename || 'demo_document.jpg');
      newImages.push(imgData);
    }

    store.setState({
      activeScenarioId: scenarioId,
      rawText: scenario.textNote || '',
      images: newImages,
      uploadedFiles: [],
      outputLanguage: scenario.targetOutputLanguage || 'English',
      // Reset prior analysis when loading new scenario
      verifiedCarePlan: null,
      pass1Result: null,
      pass2Result: null,
      metrics: null,
      chatMessages: [],
      activeView: 'after'
    });
  }

  async handleRunAnalysis() {
    const state = store.getState();
    const apiKey = store.getApiKey();

    if (!apiKey) {
      // Prompt user to enter their API key
      const modal = document.getElementById('api-key-modal');
      if (modal) {
        modal.style.display = 'flex';
        const keyInput = document.getElementById('gemini-key-input');
        if (keyInput) keyInput.focus();
      }
      alert('Please enter your Google AI Studio Gemini API Key to run real analysis.');
      return;
    }

    store.setState({
      isAnalyzing: true,
      currentStage: 'reading',
      progressMessage: 'Initializing multimodal analysis pipeline...',
      pipelineError: null
    });

    try {
      const result = await runHelpBridgePipeline({
        apiKey,
        rawText: state.rawText,
        images: state.images,
        documents: state.uploadedFiles,
        outputLanguage: state.outputLanguage,
        onStageChange: ({ stage, message }) => {
          store.setState({
            currentStage: stage,
            progressMessage: message
          });
        }
      });

      store.setState({
        isAnalyzing: false,
        pass1Result: result.pass1,
        pass2Result: result.pass2,
        verifiedCarePlan: result.verifiedPlan,
        metrics: result.metrics,
        activeView: 'after',
        chatMessages: []
      });

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-container-panel');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);

    } catch (err) {
      console.error('HelpBridge Pipeline Error:', err);
      store.setState({
        isAnalyzing: false,
        pipelineError: err.message
      });

      if (err.message && err.message.includes('MISSING_API_KEY')) {
        const modal = document.getElementById('api-key-modal');
        if (modal) modal.style.display = 'flex';
      } else {
        alert(`Analysis failed: ${err.message || 'Unknown error occurred. Please check your network and Gemini API key.'}`);
      }
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new HelpBridgeApp();
});
