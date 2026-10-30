export interface VocaliseConfig {
  voiceName: string;
  rate: number;
  language: string;
  highlightText: boolean;
  autoDetectLanguage: boolean;
}

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  currentPosition: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  provider?: 'devin' | 'copilot';
}
