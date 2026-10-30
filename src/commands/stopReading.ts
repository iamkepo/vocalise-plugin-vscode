import * as vscode from 'vscode';
import { SpeechManager } from '../utils/speech';

export function registerStopReadingCommand(
  context: vscode.ExtensionContext,
  speechManager: SpeechManager
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.stopReading', () => {
    speechManager.stop();
    vscode.window.showInformationMessage('Reading stopped');
  });
}
