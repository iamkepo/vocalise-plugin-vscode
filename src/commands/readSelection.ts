import * as vscode from 'vscode';
import { SpeechManager } from '../utils/speech';

export function registerReadSelectionCommand(
  context: vscode.ExtensionContext,
  speechManager: SpeechManager
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.readSelection', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active text editor. Try "Read Clipboard" for chat messages.');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showInformationMessage('No text selected. Please select some text to read.');
      return;
    }

    speechManager.speak(selectedText);
    vscode.window.showInformationMessage('Reading selection...');
  });
}

export function registerReadClipboardCommand(
  context: vscode.ExtensionContext,
  speechManager: SpeechManager
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.readClipboard', async () => {
    const clipboardText = await vscode.env.clipboard.readText();

    if (!clipboardText) {
      vscode.window.showInformationMessage('Clipboard is empty. Copy some text first.');
      return;
    }

    speechManager.speak(clipboardText);
    vscode.window.showInformationMessage('Reading clipboard content...');
  });
}
