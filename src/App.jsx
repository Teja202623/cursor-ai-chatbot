import { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "👋 Hi there! I'm your assistant from Digital Marketing Genius." },
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
