import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi there! I'm the DMG AI Assistant — here to help you build a beautiful, high-converting website for your small business. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://chatbot.digitalmarketinggenius.com.au/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      const reply = data.answer || "⚠️ No response from assistant.";
      setMessages([...newMessages, { sender: 'bot', text: reply }]);
    } catch (err) {
      console.error('❌ Error talking to backend:', err);
      setMessages([...newMessages, { sender: 'bot', text: "⚠️ Something went wrong!" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>🤖</div>
          <div style={styles.title}>DMG AI Assistant</div>
        </div>
        <div style={styles.headerRight}>⋯</div>
      </div>

      <div style={styles.chat}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.sender === 'bot' ? styles.botMsg : styles.userMsg}>
            {msg.text}
          </div>
        ))}
        {loading && <div style={styles.botMsg}>⏳ Typing...</div>}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a question..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    borderRadius: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    fontFamily: 'sans-serif',
  },
  header: {
    background: 'linear-gradient(90deg, #0f172a, #1e293b)',
    color: '#fff',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '600',
    fontSize: '15px',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    fontSize: '20px',
    marginRight: '8px',
  },
  title: {
    fontWeight: '600',
    fontSize: '15px',
  },
  headerRight: {
    fontSize: '18px',
    color: '#ccc',
    cursor: 'pointer',
  },
  chat: {
    flex: 1,
    padding: 16,
    overflowY: 'auto',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
  },
  botMsg: {
    marginBottom: 10,
    background: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
  },
  userMsg: {
    marginBottom: 10,
    background: '#d9f7be',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
  },
  inputRow: {
    display: 'flex',
    padding: '12px 16px',
    borderTop: '1px solid #eee',
    backgroundColor: '#fff',
    flexShrink: 0,
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    padding: '10px 16px',
    fontSize: '1rem',
    backgroundColor: '#0A2540',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
};

export default App;
