import * as vscode from 'vscode';
import { VocaliseMCPServer } from '../mcp-server';

export function registerStopMCPServerCommand(
  context: vscode.ExtensionContext,
  mcpServer: VocaliseMCPServer
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.stopMcpServer', async () => {
    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Stopping Vocalise MCP Server...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0, message: 'Shutting down...' });
          await mcpServer.stop();
          progress.report({ increment: 100, message: 'Server stopped successfully!' });
        }
      );

      vscode.window.showInformationMessage('Vocalise MCP Server stopped successfully');
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to stop MCP Server: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
}
