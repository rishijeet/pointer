# Pointer - VS Code Extension

<img src="https://github.com/user-attachments/assets/f54ad383-4b52-46a2-a3f8-8976bbb1fdcd" width="20%">

A powerful VS Code extension that transforms chat output into file operations. Create, modify, or delete files directly from your conversation history.

## Features

- **File Operations from Chat**: Convert chat messages into file operations
- **Simple Syntax**: Easy-to-use command format
- **Workspace Integration**: Seamlessly modifies files in your current workspace
- **Automatic File Opening**: Created/modified files automatically open in editor

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

© Rishijeet Mishra 
