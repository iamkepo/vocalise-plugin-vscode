import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SpeechManager } from '../utils/speech';
import { VocaliseConfig } from '../types';

export interface MCPServerState {
  status: 'stopped' | 'starting' | 'running' | 'error';
  error?: string;
  port?: number;
}

export class VocaliseMCPServer {
  private server: Server | null = null;
  private transport: StdioServerTransport | null = null;
  private speechManager: SpeechManager;
  private state: MCPServerState = { status: 'stopped' };
  private stateChangeCallback?: (state: MCPServerState) => void;

  constructor(speechManager: SpeechManager) {
    this.speechManager = speechManager;
  }

  onStateChange(callback: (state: MCPServerState) => void): void {
    this.stateChangeCallback = callback;
  }

  private updateState(newState: Partial<MCPServerState>): void {
    this.state = { ...this.state, ...newState };
    this.stateChangeCallback?.(this.state);
  }

  async start(): Promise<void> {
    if (this.state.status === 'running' || this.state.status === 'starting') {
      return;
    }

    this.updateState({ status: 'starting' });

    try {
      // Create MCP server
      this.server = new Server(
        {
          name: 'vocalise-mcp-server',
          version: '0.1.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      // Register tools
      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            {
              name: 'read_response',
              description: 'Read the AI chat response aloud using text-to-speech',
              inputSchema: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'The text to read aloud',
                  },
                },
                required: ['text'],
              },
            },
            {
              name: 'pause_reading',
              description: 'Pause the current speech synthesis',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
            {
              name: 'resume_reading',
              description: 'Resume the paused speech synthesis',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
            {
              name: 'stop_reading',
              description: 'Stop the current speech synthesis',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
            {
              name: 'get_speech_state',
              description: 'Get the current state of speech synthesis',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
          ],
        };
      });

      // Handle tool calls
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
          switch (name) {
            case 'read_response':
              if (typeof args?.text === 'string') {
                this.speechManager.speak(args.text);
                return {
                  content: [
                    {
                      type: 'text',
                      text: `Reading response: ${args.text.substring(0, 50)}...`,
                    },
                  ],
                };
              }
              throw new Error('Missing or invalid text argument');

            case 'pause_reading':
              this.speechManager.pause();
              return {
                content: [
                  {
                    type: 'text',
                    text: 'Reading paused',
                  },
                ],
              };

            case 'resume_reading':
              this.speechManager.resume();
              return {
                content: [
                  {
                    type: 'text',
                    text: 'Reading resumed',
                  },
                ],
              };

            case 'stop_reading':
              this.speechManager.stop();
              return {
                content: [
                  {
                    type: 'text',
                    text: 'Reading stopped',
                  },
                ],
              };

            case 'get_speech_state':
              const state = this.speechManager.getState();
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(state, null, 2),
                  },
                ],
              };

            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      });

      // Start stdio transport
      this.transport = new StdioServerTransport();
      await this.server.connect(this.transport);

      this.updateState({ status: 'running' });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state.status === 'stopped') {
      return;
    }

    try {
      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }

      if (this.server) {
        await this.server.close();
        this.server = null;
      }

      this.updateState({ status: 'stopped', error: undefined });
    } catch (error) {
      this.updateState({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  getState(): MCPServerState {
    return { ...this.state };
  }

  isRunning(): boolean {
    return this.state.status === 'running';
  }
}
