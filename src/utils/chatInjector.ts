import * as vscode from 'vscode';

/**
 * Hacky solution to inject buttons into AI chat webviews
 * This is NOT officially supported and may break with VS Code updates
 */
export class ChatInjector {
  private injectedWebviews = new Set<string>();
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.startWatching();
  }

  private startWatching(): void {
    // Watch for text editor changes to detect chat panels
    const interval = setInterval(() => {
      this.injectIntoActiveWebview();
    }, 2000);

    this.disposables.push(
      new vscode.Disposable(() => clearInterval(interval))
    );

    // Also watch for panel changes
    const panelDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
      this.injectIntoActiveWebview();
    });

    this.disposables.push(panelDisposable);
  }

  private async injectIntoActiveWebview(): Promise<void> {
    try {
      // Try to find chat-related webviews
      // This is a heuristic - we look for panels that might be chat
      const allWebviews = this.findWebviewPanels();

      for (const webview of allWebviews) {
        const webviewId = this.getWebviewId(webview);

        if (!this.injectedWebviews.has(webviewId)) {
          await this.injectScript(webview);
          this.injectedWebviews.add(webviewId);
        }
      }
    } catch (error) {
      // Silently fail - this is a hacky solution
      console.error('Chat injection error:', error);
    }
  }

  private findWebviewPanels(): any[] {
    // VS Code doesn't expose a direct API to get all webviews
    // We'll try to access them through undocumented means if possible
    // For now, return empty array - the actual injection will happen
    // through a different mechanism
    return [];
  }

  private getWebviewId(webview: any): string {
    // Generate a unique ID for the webview
    return webview.toString();
  }

  private async injectScript(webview: any): Promise<void> {
    const script = this.getInjectionScript();

    try {
      // Try to inject script into webview
      // This method depends on VS Code's internal API which may change
      if (webview.webview) {
        await webview.webview.postMessage({
          type: 'inject-script',
          script: script
        });
      }
    } catch (error) {
      console.error('Failed to inject script:', error);
    }
  }

  private getInjectionScript(): string {
    return `
      (function() {
        console.log('Vocalise: Chat injector loaded');

        // Function to add read button to AI messages
        function addReadButtons() {
          // Look for AI chat messages
          // This depends on the actual DOM structure of the chat provider
          const messageElements = document.querySelectorAll('[class*="message"], [class*="assistant"], [class*="response"]');

          messageElements.forEach((message, index) => {
            // Check if we already added a button
            if (message.querySelector('.vocalise-read-btn')) {
              return;
            }

            // Determine if this is an AI message
            const text = message.textContent || '';
            if (text.length < 20) return; // Skip short messages

            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'vocalise-button-container';
            buttonContainer.style.cssText = \`
              position: absolute;
              top: 8px;
              right: 8px;
              display: flex;
              gap: 8px;
              z-index: 1000;
            \`;

            // Create read button
            const readBtn = document.createElement('button');
            readBtn.className = 'vocalise-read-btn';
            readBtn.innerHTML = '🔊';
            readBtn.title = 'Read with Vocalise';
            readBtn.style.cssText = \`
              background: #007acc;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 6px 12px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 4px;
              transition: background 0.2s;
            \`;

            readBtn.onmouseover = () => {
              readBtn.style.background = '#005a9e';
            };

            readBtn.onmouseout = () => {
              readBtn.style.background = '#007acc';
            };

            readBtn.onclick = () => {
              const messageText = message.textContent || '';
              // Send message to VS Code extension
              if (typeof vscode !== 'undefined' && vscode.postMessage) {
                vscode.postMessage({
                  type: 'vocalise-read',
                  text: messageText
                }, '*');
              } else {
                // Fallback: try to use VS Code API
                console.log('Vocalise: Reading message', messageText.substring(0, 50));
              }
            };

            buttonContainer.appendChild(readBtn);

            // Add the button to the message
            if (message.style.position !== 'relative') {
              message.style.position = 'relative';
            }
            message.appendChild(buttonContainer);
          });
        }

        // Use MutationObserver to watch for new messages
        const observer = new MutationObserver((mutations) => {
          addReadButtons();
        });

        // Start observing the document body
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Initial run
        addReadButtons();

        // Listen for messages from extension
        window.addEventListener('message', (event) => {
          if (event.data.type === 'vocalise-state') {
            // Update button states based on speech state
            updateButtonStates(event.data.state);
          }
        });

        function updateButtonStates(state) {
          const buttons = document.querySelectorAll('.vocalise-read-btn');
          buttons.forEach(btn => {
            if (state.isSpeaking) {
              btn.innerHTML = state.isPaused ? '▶️' : '⏸️';
              btn.title = state.isPaused ? 'Resume' : 'Pause';
            } else {
              btn.innerHTML = '🔊';
              btn.title = 'Read with Vocalise';
            }
          });
        }
      })();
    `;
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.injectedWebviews.clear();
  }
}
