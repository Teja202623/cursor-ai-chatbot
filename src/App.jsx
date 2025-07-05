import { useState } from 'react';
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
    </div>
  );
}

export default App;
