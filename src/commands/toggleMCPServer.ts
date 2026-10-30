import * as vscode from 'vscode';
import { VocaliseMCPServer } from '../mcp-server';

export function registerToggleMCPServerCommand(
  context: vscode.ExtensionContext,
  mcpServer: VocaliseMCPServer
): vscode.Disposable {
  return vscode.commands.registerCommand('vocalise.toggleMcpServer', async () => {
    const state = mcpServer.getState();

    if (state.status === 'running') {
      await vscode.commands.executeCommand('vocalise.stopMcpServer');
    } else {
      await vscode.commands.executeCommand('vocalise.startMcpServer');
    }
  });
}
