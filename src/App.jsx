<<<<<<< HEAD
import { useState } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

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
=======
import { useState, useEffect } from 'react';
import './App.css';

const systemPrompt = `
You are a helpful assistant for Digital Marketing Genius, a web design agency in Australia.
You help small business owners explore demo websites. Answer questions about:
- available industry demos (trades, eCommerce, services)
- pricing ($1000–$1500)
- tech stack (WordPress, Astra, Spectra)
- timeline (~2 weeks)
Always be friendly, helpful, and guide users to explore the demos on https://digitalmarketinggenius.com.au/portfolio
`;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // ✅ Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'bot-message') {
        setMessages((prev) => [...prev, { role: 'assistant', content: event.data.text }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...newMessages
        ],
    })});

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || 'Something went wrong.';

    setMessages([...newMessages, { role: 'assistant', content: reply }]);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>💬 DMG Chatbot (MVP)</h2>
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', minHeight: '300px', marginBottom: '1rem', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        placeholder="Ask a question..."
        style={{ width: '80%', padding: '0.5rem', fontSize: '1rem' }}
      />
      <button onClick={sendMessage} style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>Send</button>
>>>>>>> cfb2acde15d9f7c9675968bc7b43efc7a2b26040
    </div>
  );
}

<<<<<<< HEAD
const styles = {
  container: { maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' },
  chat: { padding: 20, border: '1px solid #ccc', borderRadius: 10, minHeight: 300, background: '#f9f9f9' },
  botMsg: { marginBottom: 10, background: '#e6f7ff', padding: 10, borderRadius: 5 },
  userMsg: { marginBottom: 10, background: '#d9f7be', padding: 10, borderRadius: 5, alignSelf: 'flex-end' },
  inputRow: { display: 'flex', gap: 10, marginTop: 10 },
  input: { flex: 1, padding: 10, fontSize: 16 },
  button: { padding: '10px 16px', fontSize: 16, background: '#0A2540', color: 'white', border: 'none', borderRadius: 5 }
};

=======
>>>>>>> cfb2acde15d9f7c9675968bc7b43efc7a2b26040
export default App;
