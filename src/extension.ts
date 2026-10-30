import * as vscode from 'vscode';
import { SpeechManager } from './utils/speech';
import { ConfigManager } from './utils/config';
import { registerReadSelectionCommand, registerReadClipboardCommand } from './commands/readSelection';
import { registerReadFileCommand } from './commands/readFile';
import { registerStopReadingCommand } from './commands/stopReading';
import { registerTogglePauseCommand } from './commands/togglePause';

let speechManager: SpeechManager;
let configManager: ConfigManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('Vocalise extension is now active');

  try {
    // Initialize configuration manager
    configManager = new ConfigManager(context);

    // Initialize speech manager
    speechManager = new SpeechManager(configManager.getConfig(), () => {});

    // Register basic commands only
    const disposables = [
      registerReadSelectionCommand(context, speechManager),
      registerReadClipboardCommand(context, speechManager),
      registerReadFileCommand(context, speechManager),
      registerStopReadingCommand(context, speechManager),
      registerTogglePauseCommand(context, speechManager),

      // Settings command
      vscode.commands.registerCommand('vocalise.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'vocalise');
      }),

      // Watch for config changes
      configManager.onConfigChanged(() => {
        speechManager.updateConfig(configManager.getConfig());
      })
    ];

    // Add all disposables to context
    disposables.forEach(disposable => context.subscriptions.push(disposable));

    // Show welcome message
    vscode.window.showInformationMessage(
      'Vocalise is now active! Try: Ctrl+Shift+P → "Vocalise: Read Selection Aloud"'
    );

    console.log('Vocalise extension activated successfully');
  } catch (error) {
    console.error('Error activating Vocalise extension:', error);
    vscode.window.showErrorMessage(`Failed to activate Vocalise: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function deactivate() {
  console.log('Vocalise extension is deactivating');
  
  if (speechManager) {
    speechManager.stop();
  }
}
