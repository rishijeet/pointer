import React, { useState, useEffect, useRef } from 'react';

// It's a good practice to declare the type for the VS Code API
interface VsCodeApi {
  postMessage(message: any): void;
}

// This special function is provided by VS Code in the webview environment
declare function acquireVsCodeApi(): VsCodeApi;

const Chat = () => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const vscodeApiRef = useRef<VsCodeApi | null>(null);

  // On component mount, acquire the VS Code API instance
  useEffect(() => {
    if (typeof acquireVsCodeApi === 'function') {
      vscodeApiRef.current = acquireVsCodeApi();
    }
  }, []);

  // Effect to handle incoming messages from the extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data; // The message from the extension
      if (message.type === 'reply') {
        setMessages(prev => [...prev, { text: message.text, sender: 'bot' }]);
      }
    };

    window.addEventListener('message', handleMessage);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleSend = () => {
    if (input.trim() && vscodeApiRef.current) {
      const userMessage = { text: input, sender: 'user' as const };
      setMessages([...messages, userMessage]);

      // Send the message to the extension
      vscodeApiRef.current.postMessage({
        type: 'chat',
        text: input,
      });

      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--vscode-editor-background)', color: 'var(--vscode-foreground)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender === 'user' ? 'right' : 'left', marginBottom: '10px' }}>
            <span style={{ 
                background: message.sender === 'user' ? 'var(--vscode-list-activeSelectionBackground)' : 'var(--vscode-list-inactiveSelectionBackground)', 
                padding: '8px 12px', 
                borderRadius: '12px',
                display: 'inline-block',
                maxWidth: '80%'
            }}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid var(--vscode-sideBar-border)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          style={{ 
              flex: 1, 
              marginRight: '10px', 
              padding: '8px',
              backgroundColor: 'var(--vscode-input-background)',
              color: 'var(--vscode-input-foreground)',
              border: '1px solid var(--vscode-input-border)',
              borderRadius: '4px'
          }}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} style={{ 
            padding: '8px 15px',
            backgroundColor: 'var(--vscode-button-background)',
            color: 'var(--vscode-button-foreground)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }}>Send</button>
      </div>
    </div>
  );
};

export default Chat;