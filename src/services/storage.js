/**
 * Privacy-First State & Storage Management
 * In accordance with Hackathon Responsible AI principles:
 * - No user medical data is ever persisted to server or long-term tracking.
 * - State is kept strictly in-memory during the active browser session.
 * - API Key can be entered by the user or read from window/environment.
 */

class AppStore {
  constructor() {
    this.subscribers = new Set();
    this.resetState();
  }

  resetState() {
    this.state = {
      // Inputs
      rawText: '',
      images: [], // array of { id, name, mimeType, base64, dataUrl, size }
      uploadedFiles: [], // array of { id, name, mimeType, content, isPdf }
      speechLanguage: 'en-IN',
      outputLanguage: 'English', // 'English' | 'हिन्दी' | 'मराठी'
      activeScenarioId: null,

      // Analysis Pipeline
      isAnalyzing: false,
      currentStage: null, // 'reading' | 'extracting' | 'verifying' | 'building' | 'complete'
      progressMessage: '',
      pipelineError: null,

      // Pass 1 and Pass 2 Results
      pass1Result: null,
      pass2Result: null,
      verifiedCarePlan: null, // Combined sanitized plan

      // UI View States
      activeView: 'after', // 'before' | 'after'
      selectedFactId: null,
      completedActionIds: new Set(),
      metrics: null,

      // Grounded Q&A Chat
      chatMessages: [],
      isChatLoading: false
    };
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      try {
        callback(this.state);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    }
  }

  // Clear all medical data from memory
  clearAllMedicalData() {
    this.resetState();
    this.notify();
  }

  // API Key management
  getApiKey() {
    // 1. window global (e.g., AI Studio injected)
    if (typeof window !== 'undefined') {
      if (window.GEMINI_API_KEY && typeof window.GEMINI_API_KEY === 'string') {
        return window.GEMINI_API_KEY.trim();
      }
      if (window.__GEMINI_API_KEY__ && typeof window.__GEMINI_API_KEY__ === 'string') {
        return window.__GEMINI_API_KEY__.trim();
      }
      // 2. Session / local storage
      try {
        const stored = sessionStorage.getItem('helpbridge_gemini_api_key') || localStorage.getItem('helpbridge_gemini_api_key');
        if (stored) return stored.trim();
      } catch (e) {
        // LocalStorage access might be restricted in some iframes
      }
    }
    return '';
  }

  setApiKey(key, persist = false) {
    const trimmed = (key || '').trim();
    if (typeof window !== 'undefined') {
      window.GEMINI_API_KEY = trimmed;
      try {
        if (trimmed) {
          sessionStorage.setItem('helpbridge_gemini_api_key', trimmed);
          if (persist) {
            localStorage.setItem('helpbridge_gemini_api_key', trimmed);
          }
        } else {
          sessionStorage.removeItem('helpbridge_gemini_api_key');
          localStorage.removeItem('helpbridge_gemini_api_key');
        }
      } catch (e) {
        // ignore storage quota / sandbox issues
      }
    }
    this.notify();
  }

  toggleActionComplete(actionIndex) {
    const current = new Set(this.state.completedActionIds);
    if (current.has(actionIndex)) {
      current.delete(actionIndex);
    } else {
      current.add(actionIndex);
    }
    this.setState({ completedActionIds: current });
  }
}

export const store = new AppStore();
