# Vocalise VS Code Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/vocalise-vscode)](https://github.com/YOUR_USERNAME/vocalise-vscode/issues)
[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/vocalise-vscode)](https://github.com/YOUR_USERNAME/vocalise-vscode)

Text-to-speech extension for VS Code using native system TTS.

## Features

- 🎯 **Read Selected Text**: Read selected text aloud from any editor
- � **Read Clipboard**: Read clipboard content (useful for AI chat responses)
- 📄 **Read Entire File**: Read the entire current file
- ⏸️ **Playback Controls**: Pause, resume, and stop reading
- ⚙️ **Customizable**: Configure voice, speed, and language in settings
- 🌍 **Multi-language**: Support for multiple languages with auto-detection
- 💻 **Cross-platform**: Works on macOS, Windows, and Linux using native TTS

## Installation

### From VSIX (Local)
1. Download the `.vsix` file from the Vocalise website
2. Open VS Code
3. Run `Extensions: Install from VSIX...` command (Ctrl+Shift+P or Cmd+Shift+P)
4. Select the downloaded `.vsix` file
5. Reload VS Code when prompted

### From Command Line
```bash
code --install-extension vocalise-vscode-0.1.0.vsix
```

## Usage

### Basic Commands

Use the Command Palette (Ctrl+Shift+P or Cmd+Shift+P) and search for:

| Command | Description |
|---------|-------------|
| Vocalise: Read Selection Aloud | Read the currently selected text in an editor |
| Vocalise: Read Clipboard Aloud | Read the clipboard content (useful for AI chat responses) |
| Vocalise: Read File Aloud | Read the entire current file |
| Vocalise: Stop Reading | Stop any ongoing reading |
| Vocalise: Pause/Resume Reading | Pause or resume reading |

### Reading AI Chat Responses

To read AI chat responses (Devin, Copilot, etc.):

1. Select the AI response text in the chat
2. Copy the text (Cmd+C or Ctrl+C)
3. Use "Vocalise: Read Clipboard Aloud" command
4. The text will be read with automatic language detection

### Language Detection

The extension automatically detects the language:
- **French**: Detected by accented characters (é, è, ê, à, ç, etc.)
- **English**: Default language if no French characters detected
- **Other languages**: Spanish, German, Italian supported

## Configuration

Open VS Code settings (Ctrl+, or Cmd+,) and search for "Vocalise":

| Setting | Default | Description |
|---------|---------|-------------|
| `vocalise.voiceName` | (empty) | Name of the voice to use (system-specific) |
| `vocalise.rate` | 1.0 | Speech rate (0.5 = slow, 1.0 = normal, 2.0 = fast) |
| `vocalise.language` | auto | Language for speech synthesis |
| `vocalise.highlightText` | true | Highlight the currently spoken word |
| `vocalise.autoDetectLanguage` | true | Automatically detect language from text |

## System Requirements

- **macOS**: Uses the built-in `say` command
- **Windows**: Uses PowerShell with System.Speech
- **Linux**: Uses `espeak` (install if not present)

## Development

### Build
```bash
npm install
npm run compile
```

### Watch Mode
```bash
npm run watch
```

### Package Extension
```bash
npm run package
```

This will create a `vocalise-vscode-0.1.0.vsix` file that can be installed.

## Current Limitations

- Direct integration into AI chat interfaces (buttons on each response) is not yet available
- To read AI responses, use the "Read Clipboard Aloud" command after copying
- Extension works with text selections in file editors

## Roadmap

- [ ] Direct AI chat integration with button on each response (when VS Code API supports it)
- [ ] Custom voice selection UI
- [ ] Reading entire chat threads
- [ ] Skip code blocks option
- [ ] Keyboard shortcuts (currently causing conflicts with other extensions)
- [ ] Reading history
- [ ] Improved voice quality with external TTS libraries

## Contributing

Contributions are welcome! This project is open source and we encourage contributions from the community.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vocalise-vscode.git
cd vocalise-vscode

# Install dependencies
npm install

# Watch for changes
npm run watch

# Package the extension
npm run package
```

### Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub:
https://github.com/YOUR_USERNAME/vocalise-vscode/issues

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## GitHub Repository

This project is open source! Check out the repository:
https://github.com/YOUR_USERNAME/vocalise-vscode

## Author

Vocalise Team
