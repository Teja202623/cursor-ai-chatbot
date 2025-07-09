/*
import { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "👋 Hi there! I'm the DMG AI Assistant — here to help you build a beautiful, high-converting website for your small business. Ask me anything!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
  
    try {
      // 🔁 NEW: Call your Express API
      const res = await fetch('https://chatbot.digitalmarketinggenius.com.au/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input })
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

  return (
    <div style={styles.container}>
      <h2>DMG AI Assistant 🤖</h2>
      <div style={styles.chat}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.sender === 'bot' ? styles.botMsg : styles.userMsg}>
            {msg.text}
          </div>
        ))}
        {loading && <div style={styles.botMsg}>⏳ Typing...</div>}
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
  container: { maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' },
  chat: { padding: 20, border: '1px solid #ccc', borderRadius: 10, minHeight: 300, background: '#f9f9f9' },
  botMsg: { marginBottom: 10, background: '#e6f7ff', padding: 10, borderRadius: 5 },
  userMsg: { marginBottom: 10, background: '#d9f7be', padding: 10, borderRadius: 5, alignSelf: 'flex-end' },
  inputRow: { display: 'flex', gap: 10, marginTop: 10 },
  input: { flex: 1, padding: 10, fontSize: 16 },
  button: { padding: '10px 16px', fontSize: 16, background: '#0A2540', color: 'white', border: 'none', borderRadius: 5 }
};

export default App;
*/
import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "👋 Hi there! I'm the DMG AI Assistant — here to help you build a beautiful, high-converting website for your small business. Ask me anything!" },
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
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>DMG AI Assistant 🤖</div>
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
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f2f5',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    maxHeight: 640,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    fontFamily: 'sans-serif'
  },
  header: {
    backgroundColor: '#0A2540',
    color: '#fff',
    padding: '14px 20px',
    fontSize: '1rem',
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 0,
  },
  chat: {
    flex: 1,
    padding: 16,
    overflowY: 'auto',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column'
  },
  botMsg: {
    marginBottom: 10,
    background: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%'
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
    maxWidth: '100%'
  },
  inputRow: {
    display: 'flex',
    padding: 12,
    borderTop: '1px solid #ddd',
    backgroundColor: '#fff',
    flexShrink: 0
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '1rem',
    borderRadius: 6,
    border: '1px solid #ccc',
    outline: 'none'
  },
  button: {
    marginLeft: 10,
    padding: '10px 16px',
    fontSize: '1rem',
    backgroundColor: '#0A2540',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer'
  }
};

export default App;
