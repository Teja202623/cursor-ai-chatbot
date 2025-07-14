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
      window.parent.postMessage({ type: "user-message-sent" }, "*"); // ✅ notify parent page
    } catch (err) {
      console.error('❌ Error talking to backend:', err);
      setMessages([...newMessages, { sender: 'bot', text: "⚠️ Something went wrong!" }]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Track user typing state in real-time
  useEffect(() => {
    const engaged = input.trim().length > 0;
    window.parent.postMessage({ type: "user-engaged", engaged }, "*");
  }, [input]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="https://digitalmarketinggenius.com.au/wp-content/uploads/2025/07/https://digitalmarketinggenius.com.au/wp-content/uploads/2025/07/digital-marketing-genius-logo-australia.png" alt="DMG Logo" style={styles.logo} />
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

        {loading && (
          <div style={{ ...styles.botMsg, ...styles.typing }}>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
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
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#000',
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
    height: '28px',
    width: '28px',
    marginRight: '10px',
    borderRadius: '6px',
    objectFit: 'contain',
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
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  botMsg: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    color: '#000',
    padding: 12,
    borderRadius: 12,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'anywhere',
    maxWidth: '85%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: '#000',
    color: '#fff',
    padding: 12,
    borderRadius: 12,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '85%',
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
    padding: '10px 14px',
    fontSize: '1rem',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  button: {
    padding: '10px 18px',
    fontSize: '1rem',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  typing: {
    fontStyle: 'italic',
    fontSize: '14px',
    opacity: 0.8,
  },
};

export default App;