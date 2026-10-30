import * as vscode from 'vscode';
import { VocaliseMCPServer } from '../mcp-server';
import { SpeechManager } from '../utils/speech';

export class VocaliseMCPApp {
  private mcpServer: VocaliseMCPServer;
  private speechManager: SpeechManager;

  constructor(mcpServer: VocaliseMCPServer, speechManager: SpeechManager) {
    this.mcpServer = mcpServer;
    this.speechManager = speechManager;
  }

  async initialize(): Promise<void> {
    // Note: The MCP App API is still evolving
    // For now, we'll use the MCP server tools which are more stable
    // The UI buttons will be registered through the VS Code contribution points

    console.log('Vocalise MCP App initialized');
  }

  /**
   * Register custom UI contributions for chat
   * This will be called from the extension activation
   */
  registerChatUI(context: vscode.ExtensionContext): void {
    // Register the chat button contribution
    // Note: This is a placeholder - actual implementation depends on VS Code API availability
    context.subscriptions.push(
      vscode.commands.registerCommand('vocalise.readChatMessage', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (text) {
          this.speechManager.speak(text);
          vscode.window.showInformationMessage('Reading chat response...');
        } else {
          vscode.window.showWarningMessage('Please select the AI response to read');
        }
      })
    );
  }

  dispose(): void {
    // Cleanup app resources
  }
}
