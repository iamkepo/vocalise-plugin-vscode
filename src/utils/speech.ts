import * as vscode from 'vscode';
import { VocaliseConfig, SpeechState } from '../types';
import { exec } from 'child_process';
import { platform } from 'os';

export class SpeechManager {
  private state: SpeechState = {
    isSpeaking: false,
    isPaused: false,
    currentText: '',
    currentPosition: 0
  };
  private config: VocaliseConfig;
  private onStateChange: (state: SpeechState) => void;
  private currentProcess: any = null;

  constructor(config: VocaliseConfig, onStateChange: (state: SpeechState) => void) {
    this.config = config;
    this.onStateChange = onStateChange;
  }

  private preprocessText(text: string): string {
    let processed = text;
    processed = processed.replace(/\bM\./g, 'Monsieur');
    processed = processed.replace(/\bMme\./g, 'Madame');
    processed = processed.replace(/\bDr\./g, 'Doctor');
    processed = processed.replace(/\bPr\./g, 'Professor');
    processed = processed.replace(/…/g, '...');
    processed = processed.replace(/–/g, '-');
    processed = processed.replace(/—/g, '-');
    processed = processed.replace(/```[\s\S]*?```/g, '[code block skipped]');
    return processed;
  }

  speak(text: string): void {
    this.stop();
    const processedText = this.preprocessText(text);
    if (!processedText) return;

    this.state.isSpeaking = true;
    this.state.isPaused = false;
    this.state.currentText = text;
    this.onStateChange({ ...this.state });

    // Detect language and use appropriate voice
    const detectedLang = this.detectLanguage(text);
    const voiceName = this.getVoiceForLanguage(detectedLang);

    if (platform() === 'darwin') {
      this.currentProcess = exec(`say -v "${voiceName}" -r ${this.config.rate} "${processedText}"`);
    } else if (platform() === 'win32') {
      this.currentProcess = exec(`powershell -Command "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.Speak; $speak.Speak('${processedText.replace(/'/g, "''")}')"`);
    } else {
      this.currentProcess = exec(`espeak -v "${voiceName}" -s ${Math.round(150 * this.config.rate)} "${processedText}"`);
    }

    if (this.currentProcess) {
      this.currentProcess.on('close', () => {
        this.state.isSpeaking = false;
        this.state.isPaused = false;
        this.state.currentText = '';
        this.onStateChange({ ...this.state });
      });

      this.currentProcess.on('error', (error: any) => {
        console.error('Speech synthesis error:', error);
        this.state.isSpeaking = false;
        this.state.isPaused = false;
        this.onStateChange({ ...this.state });
      });
    }
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const frenchPatterns = /[àâäéèêëïîôôöùûüÿç]/i;
    const englishPatterns = /[a-zA-Z]/;

    if (frenchPatterns.test(text)) {
      return 'fr';
    }
    return this.config.language === 'auto' ? 'en' : this.config.language;
  }

  private getVoiceForLanguage(lang: string): string {
    if (platform() === 'darwin') {
      // macOS voices
      const voices: Record<string, string> = {
        'fr': 'Thomas',
        'en': 'Alex',
        'es': 'Jorge',
        'de': 'Anna',
        'it': 'Alice'
      };
      return voices[lang] || voices['fr'];
    } else if (platform() === 'win32') {
      // Windows - just use default, would need more complex voice selection
      return lang;
    } else {
      // Linux - espeak voices
      const voices: Record<string, string> = {
        'fr': 'fr-fr',
        'en': 'en',
        'es': 'es',
        'de': 'de',
        'it': 'it'
      };
      return voices[lang] || voices['fr'];
    }
  }

  pause(): void {
    if (this.state.isSpeaking && !this.state.isPaused) {
      this.state.isPaused = true;
      this.onStateChange({ ...this.state });
    }
  }

  resume(): void {
    if (this.state.isSpeaking && this.state.isPaused) {
      this.state.isPaused = false;
      this.onStateChange({ ...this.state });
      this.speak(this.state.currentText);
    }
  }

  stop(): void {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
    this.state.isSpeaking = false;
    this.state.isPaused = false;
    this.state.currentText = '';
    this.state.currentPosition = 0;
    this.onStateChange({ ...this.state });
  }

  togglePause(): void {
    if (this.state.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  getState(): SpeechState {
    return { ...this.state };
  }

  updateConfig(config: Partial<VocaliseConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
