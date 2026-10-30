import * as vscode from 'vscode';
import { VocaliseMCPServer } from '../mcp-server';

export function registerStartMCPServerCommand(
  context: vscode.ExtensionContext,
  mcpServer: VocaliseMCPServer
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.startMcpServer', async () => {
    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Starting Vocalise MCP Server...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0, message: 'Initializing...' });
          await mcpServer.start();
          progress.report({ increment: 100, message: 'Server started successfully!' });
        }
      );

      vscode.window.showInformationMessage('Vocalise MCP Server started successfully');
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to start MCP Server: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
}
