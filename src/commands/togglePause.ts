import * as vscode from 'vscode';
import { SpeechManager } from '../utils/speech';

export function registerTogglePauseCommand(
  context: vscode.ExtensionContext,
  speechManager: SpeechManager
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.togglePause', () => {
    speechManager.togglePause();
    const state = speechManager.getState();
    vscode.window.showInformationMessage(state.isPaused ? 'Reading paused' : 'Reading resumed');
  });
}
