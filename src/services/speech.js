/**
 * Web Speech API Service
 * - Speech-to-Text (STT) for voice input in English (en-IN), Hindi (hi-IN), Marathi (mr-IN).
 * - Text-to-Speech (TTS) for "Read Aloud" functionality in the selected language.
 * - Graceful fallback & feature detection.
 */

class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.hasRecognitionSupport = Boolean(SpeechRecognition);
    this.recognition = this.hasRecognitionSupport ? new SpeechRecognition() : null;
    this.isListening = false;
    this.voices = [];

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  isSupported() {
    return this.hasRecognitionSupport;
  }

  isTtsSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  startListening({ lang = 'en-IN', onResult, onError, onEnd }) {
    if (!this.recognition) {
      if (onError) onError(new Error('Speech recognition is not supported in this browser.'));
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({ finalTranscript, interimTranscript });
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start error:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  /**
   * Reads plain-language plan text aloud
   */
  readAloud(text, language = 'English', onEnd) {
    if (!this.isTtsSupported() || !text) return;

    window.speechSynthesis.cancel(); // Stop any currently speaking speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    let targetLangCode = 'en-IN';
    if (language === 'हिन्दी') targetLangCode = 'hi-IN';
    if (language === 'मराठी') targetLangCode = 'mr-IN';

    utterance.lang = targetLangCode;

    // Pick best matching voice
    if (this.voices.length > 0) {
      const matchingVoice = this.voices.find(v => v.lang === targetLangCode) ||
        this.voices.find(v => v.lang.startsWith(targetLangCode.split('-')[0])) ||
        this.voices.find(v => v.lang.includes('IN')) ||
        this.voices[0];

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.isTtsSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking() {
    return this.isTtsSupported() && window.speechSynthesis.speaking;
  }
}

export const speechService = new SpeechService();
