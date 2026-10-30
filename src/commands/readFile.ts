import * as vscode from 'vscode';
import { SpeechManager } from '../utils/speech';

export function registerReadFileCommand(
  context: vscode.ExtensionContext,
  speechManager: SpeechManager
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.readFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active text editor');
      return;
    }

    const document = editor.document;
    const fullText = document.getText();

    if (!fullText) {
      vscode.window.showInformationMessage('File is empty');
      return;
    }

    speechManager.speak(fullText);
    vscode.window.showInformationMessage(`Reading ${document.fileName}...`);
  });
}
