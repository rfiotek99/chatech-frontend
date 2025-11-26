import { useState, useEffect, useRef } from 'react';

export default function Chat({ user, token, onLogout, darkMode, setDarkMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = 'https://chatech-backend-1.onrender.com';

  useEffect(() => {
    loadHistory();
    const timer = setTimeout(() => setShowChat(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chats/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.chats && data.chats.length > 0) {
        setMessages(data.chats.map(chat => ({
          id: chat.id,
          user: chat.user_message,
          bot: chat.bot_response,
          timestamp: chat.created_at
        })));
        setShowChat(true);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/chat?message=${encodeURIComponent(userMessage)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setMessages([...messages, {
        id: Date.now(),
        user: userMessage,
        bot: data.botResponse,
        timestamp: data.timestamp
      }]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!showChat) {
    return (
      <div className="welcome-page">
        <div className="welcome-content">
          <div className="welcome-logo">✨</div>
          <h1>ChatEch</h1>
          <p>2024</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-header-top">
        <h1>ChatEch</h1>
        <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>Hola 👋</h2>
            <p>¿Cómo puedo ayudarte hoy?</p>
          </div>
        ) : (
          <div className="messages-area">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className="msg user-msg">
                  <div className="bubble user-bubble">{msg.user}</div>
                </div>
                <div className="msg bot-msg">
                  <div className="bubble bot-bubble">{msg.bot}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-section">
        <form onSubmit={sendMessage} className="input-form">
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading}>
            {loading ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}
