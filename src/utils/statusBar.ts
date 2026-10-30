import * as vscode from 'vscode';
import { VocaliseMCPServer, MCPServerState } from '../mcp-server';

export class VocaliseStatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private mcpServer: VocaliseMCPServer;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext, mcpServer: VocaliseMCPServer) {
    this.context = context;
    this.mcpServer = mcpServer;

    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      'vocalise.status',
      vscode.StatusBarAlignment.Right,
      100
    );

    // Subscribe to state changes
    this.mcpServer.onStateChange((state) => this.updateStatusBar(state));

    // Initial update
    this.updateStatusBar(this.mcpServer.getState());

    // Show the status bar
    this.statusBarItem.show();

    // Register click handler
    this.statusBarItem.command = 'vocalise.toggleMcpServer';
  }

  private updateStatusBar(state: MCPServerState): void {
    switch (state.status) {
      case 'stopped':
        this.statusBarItem.text = '$(circle-slash) Vocalise MCP (Stopped)';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusBarItem.tooltip = 'Click to start Vocalise MCP Server';
        break;

      case 'starting':
        this.statusBarItem.text = '$(loading~spin) Vocalise MCP (Starting...)';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        this.statusBarItem.tooltip = 'Server is starting...';
        break;

      case 'running':
        this.statusBarItem.text = '$(check) Vocalise MCP (Running)';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        this.statusBarItem.tooltip = 'Click to stop Vocalise MCP Server';
        break;

      case 'error':
        this.statusBarItem.text = '$(error) Vocalise MCP (Error)';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusBarItem.tooltip = state.error || 'Server error. Click to restart';
        break;
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
