import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string || 'http://localhost:8000';

function wsUrl(path: string): string {
  const url = new URL(path, BACKEND_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.href;
}

const WS_URL = wsUrl('/chat/ws');

type Message = {
  username: string;
  message: string;
};

function App() {
  const [username, setUsername] = useState(() => `User_${Math.floor(Math.random() * 1000)}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      setConnected(true);
    };
    ws.onclose = () => {
      setConnected(false);
    };
    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };
    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ username, message: trimmed }));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!joined) {
    return (
      <div className="join-screen">
        <h1>💬 RTC Chat</h1>
        <p>Pick a username to join</p>
        <input
          className="username-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
          maxLength={30}
        />
        <button
          className="join-btn"
          disabled={!username.trim() || !connected}
          onClick={() => {
            setJoined(true);
            // announce join to the channel
            wsRef.current?.send(JSON.stringify({ username, message: "joined the chat 🎉" }));
          }}
        >
          {connected ? 'Join Chat' : 'Connecting...'}
        </button>
        {!connected && <p className="status-msg">Connecting to server…</p>}
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <header className="chat-header">
        <strong>💬 RTC Chat</strong>
        <span className="chat-status">
          <span className={`dot ${connected ? 'dot-on' : 'dot-off'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </header>
      <ul className="chat-messages" ref={listRef}>
        {messages.map((m, i) => (
          <li key={i} className={`msg ${m.username === username ? 'msg-self' : 'msg-other'}`}>
            <span className="msg-user">{m.username}</span>
            <span className="msg-text">{m.message}</span>
          </li>
        ))}
      </ul>
      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          maxLength={500}
        />
        <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App
