# Pointer - VS Code Extension

<img src="https://github.com/user-attachments/assets/f54ad383-4b52-46a2-a3f8-8976bbb1fdcd" width="20%">

A powerful VS Code extension that transforms chat output into file operations. Create, modify, or delete files directly from your conversation history.

## Features

- **Multi-Model Support**: Choose from multiple AI models (Gemini, GPT, Claude)
- **File Operations from Chat**: Convert chat messages into file operations
- **Simple Syntax**: Easy-to-use command format
- **Workspace Integration**: Seamlessly modifies files in your current workspace
- **Automatic File Opening**: Created/modified files automatically open in editor

## Setup and Configuration

### Installation

1. Install the extension from the VS Code marketplace
2. Open VS Code
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
4. Type "Open Pointer" to start using the extension

### API Key Configuration

The extension supports multiple AI models. Here's how to configure each:

#### Google Gemini
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
3. Search for "Pointer"
4. Enter your Gemini API key in the "Pointer: Gemini Api Key" setting

#### OpenAI (GPT-3.5/GPT-4)
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open VS Code Settings
3. Enter your OpenAI API key in the "Pointer: OpenAI Api Key" setting

#### Anthropic Claude
1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Open VS Code Settings
3. Enter your Claude API key in the "Pointer: Anthropic Api Key" setting

### Usage

1. Open the Pointer chat interface using the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and type "Open Pointer"
2. Select your preferred AI model from the dropdown
3. Start chatting!

## CI/CD Status

![CI/CD Build](https://github.com/rishijeet/pointer/actions/workflows/build.yml/badge.svg)
[![Release Status](https://github.com/rishijeet/pointer/actions/workflows/release.yml/badge.svg)](https://github.com/rishijeet/pointer/actions/workflows/release.yml)

This project uses GitHub Actions for continuous integration and deployment.

## Security Note

⚠️ **Important**: Your API keys are stored securely in VS Code's settings and are only used for communicating with the respective AI services. Never share your API keys or commit them to version control.

### Workflows

1. **Build & Test** - Runs on every push to `main` and pull requests:
   - Lints TypeScript code
   - Runs unit tests
   - Compiles the extension
   - [View workflow](.github/workflows/build.yml)

2. **Release** - Runs when new releases are created:
   - Packages the extension as `.vsix`
   - Attaches the artifact to the release
   - [View workflow](.github/workflows/release.yml)


## Installation

### From Marketplace (when published)
1. Open VS Code Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
2. Search for "Pointer"
3. Click Install

### Manual Installation
1. Download the `.vsix` file from Releases
2. In VS Code, go to Extensions view
3. Click the `...` menu and select "Install from VSIX..."
4. Select the downloaded file

### Development Build
```bash
git clone https://github.com/rishijeet/pointer.git
cd pointer
npm install
npm run compile
```
Then press `F5` to launch the extension in debug mode.

## Usage

### Basic Syntax
```
COMMAND: path/to/file
CONTENT:
Your file content here
```

### Examples

**Create a new file:**
```
CREATE: src/example.js
CONTENT:
function hello() {
  console.log('Hello from Pointer!');
}
```

**Modify existing file:**
```
MODIFY: package.json
CONTENT:
{
  "name": "my-project",
  "version": "1.0.0"
}
```

**Delete file:**
```
DELETE: temp.txt
```

### Running the Command
1. Select the text containing your commands
2. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Search for "Process Chat Output"
4. Press Enter

## Configuration

Currently supports these settings in `settings.json`:
```json
{
  "pointer.autoOpenFiles": true,
  "pointer.confirmDeletions": true
}
```

## Development

### Build
```bash
npm install
npm run compile
```

### Test
```bash
npm test
```
Or press `F5` to debug.

### Package
```bash
npm install -g @vscode/vsce
vsce package
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

© Rishijeet Mishra, Prathamesh Bonde
