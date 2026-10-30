import * as vscode from 'vscode';
import { SpeechManager } from '../utils/speech';
import { ChatMessage } from '../types';

/**
 * Provider for integrating with AI chat interfaces (Devin, Copilot)
 */
export class ChatIntegrationProvider {
  private speechManager: SpeechManager;
  private decorationType: vscode.TextEditorDecorationType;
  private context: vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    speechManager: SpeechManager
  ) {
    this.context = context;
    this.speechManager = speechManager;

    // Create decoration type for highlighting spoken text
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255, 200, 0, 0.3)',
      border: '2px solid rgba(255, 200, 0, 0.8)',
      borderRadius: '3px'
    });

    this.registerChatCommands();
    this.watchForChatMessages();
  }

  private registerChatCommands(): void {
    // Command to read current chat message
    vscode.commands.registerCommand('vocalise.readChatMessage', async () => {
      const message = await this.detectCurrentChatMessage();
      if (message) {
        this.speechManager.speak(message.content);
        vscode.window.showInformationMessage('Reading AI response...');
      } else {
        vscode.window.showWarningMessage('Could not detect AI chat message');
      }
    });
  }

  /**
   * Try to detect the current AI chat message from various providers
   */
  private async detectCurrentChatMessage(): Promise<ChatMessage | null> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return null;

    const document = editor.document;
    const selection = editor.selection;
    const selectedText = document.getText(selection);

    // If user has selected text, read that
    if (selectedText && selectedText.length > 10) {
      return {
        role: 'assistant',
        content: selectedText,
        provider: this.detectProvider(document.fileName)
      };
    }

    // Try to detect chat message from context
    const lines = document.getText().split('\n');
    const currentLine = selection.active.line;

    // Look for AI response patterns
    // This is a simplified detection - will need refinement based on actual chat UI
    for (let i = currentLine; i >= Math.max(0, currentLine - 50); i--) {
      const line = lines[i];
      if (this.isAIMessageStart(line)) {
        const messageContent = this.extractMessageContent(lines, i);
        if (messageContent) {
          return {
            role: 'assistant',
            content: messageContent,
            provider: this.detectProvider(document.fileName)
          };
        }
      }
    }

    return null;
  }

  private detectProvider(fileName: string): 'devin' | 'copilot' {
    if (fileName.includes('devin') || fileName.includes('agent')) {
      return 'devin';
    }
    return 'copilot';
  }

  private isAIMessageStart(line: string): boolean {
    const aiPatterns = [
      /^(AI|Assistant|Claude|GPT|Devin|Copilot):/i,
      /^>\s*(AI|Assistant|Claude|GPT|Devin|Copilot)/i,
      /^```(assistant|ai)/i,
      /^\*\*AI Response\*\*/i
    ];

    return aiPatterns.some(pattern => pattern.test(line));
  }

  private extractMessageContent(lines: string[], startIndex: number): string | null {
    const content: string[] = [];
    let inCodeBlock = false;

    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];

      // Stop if we hit another message
      if (this.isAIMessageStart(line) || this.isUserMessageStart(line)) {
        break;
      }

      // Handle code blocks
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      content.push(line);
    }

    const message = content.join('\n').trim();
    return message.length > 10 ? message : null;
  }

  private isUserMessageStart(line: string): boolean {
    const userPatterns = [
      /^(User|You|Human|Me):/i,
      /^>\s*(User|You|Human|Me)/i,
      /^```(user|human)/i
    ];

    return userPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Watch for chat-related events and provide UI enhancements
   */
  private watchForChatMessages(): void {
    // Update decorations when speech state changes
    this.speechManager['onStateChange'] = (state) => {
      this.updateHighlight(state);
    };
  }

  private updateHighlight(state: any): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !state.isSpeaking || !this.context.globalState.get('vocalise.highlightText', true)) {
      editor?.setDecorations(this.decorationType, []);
      return;
    }

    // This is a simplified highlight - in production, you'd need to track
    // the exact position in the document
    const decoration = {
      range: new vscode.Range(state.currentPosition, 0, state.currentPosition, 100),
      hoverMessage: 'Currently speaking'
    };

    editor.setDecorations(this.decorationType, [decoration]);
  }

  /**
   * Register a code action provider to add "Read with Vocalise" button
   */
  registerCodeActionProvider(): vscode.Disposable {
    return vscode.languages.registerCodeActionsProvider('*', {
      provideCodeActions: (document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext) => {
        const actions: vscode.CodeAction[] = [];

        // Check if selection looks like an AI response
        const selectedText = document.getText(range);
        if (selectedText.length > 20 && this.looksLikeAIResponse(selectedText)) {
          const action = new vscode.CodeAction(
            'Read with Vocalise',
            vscode.CodeActionKind.QuickFix
          );
          action.command = {
            command: 'vocalise.readChatMessage',
            title: 'Read with Vocalise'
          };
          actions.push(action);
        }

        return actions;
      }
    });
  }

  private looksLikeAIResponse(text: string): boolean {
    // Heuristic: AI responses often have code blocks, explanations, etc.
    return text.includes('```') || text.length > 100;
  }

  dispose(): void {
    this.decorationType.dispose();
  }
}
