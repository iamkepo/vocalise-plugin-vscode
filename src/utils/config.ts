import * as vscode from 'vscode';
import { VocaliseConfig } from '../types';

const DEFAULT_CONFIG: VocaliseConfig = {
  voiceName: '',
  rate: 1.0,
  language: 'auto',
  highlightText: true,
  autoDetectLanguage: true
};

export class ConfigManager {
  private config: VocaliseConfig;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.config = this.loadConfig();
  }

  private loadConfig(): VocaliseConfig {
    const config = vscode.workspace.getConfiguration('vocalise');
    return {
      voiceName: config.get<string>('voiceName', DEFAULT_CONFIG.voiceName),
      rate: config.get<number>('rate', DEFAULT_CONFIG.rate),
      language: config.get<string>('language', DEFAULT_CONFIG.language),
      highlightText: config.get<boolean>('highlightText', DEFAULT_CONFIG.highlightText),
      autoDetectLanguage: config.get<boolean>('autoDetectLanguage', DEFAULT_CONFIG.autoDetectLanguage)
    };
  }

  getConfig(): VocaliseConfig {
    return { ...this.config };
  }

  async updateConfig(updates: Partial<VocaliseConfig>): Promise<void> {
    const config = vscode.workspace.getConfiguration('vocalise');

    if (updates.voiceName !== undefined) {
      await config.update('voiceName', updates.voiceName, vscode.ConfigurationTarget.Global);
    }
    if (updates.rate !== undefined) {
      await config.update('rate', updates.rate, vscode.ConfigurationTarget.Global);
    }
    if (updates.language !== undefined) {
      await config.update('language', updates.language, vscode.ConfigurationTarget.Global);
    }
    if (updates.highlightText !== undefined) {
      await config.update('highlightText', updates.highlightText, vscode.ConfigurationTarget.Global);
    }
    if (updates.autoDetectLanguage !== undefined) {
      await config.update('autoDetectLanguage', updates.autoDetectLanguage, vscode.ConfigurationTarget.Global);
    }

    this.config = this.loadConfig();
  }

  onConfigChanged(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('vocalise')) {
        this.config = this.loadConfig();
        callback();
      }
    });
  }
}
