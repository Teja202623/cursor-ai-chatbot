import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import metadata from '../metadata.js'; // Adjust path if needed
import { readBody } from 'h3'; // Needed if using Node runtime with H3/Vite (optional)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

// 🧠 Handle POST requests to /api/ask
/*
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { question } = req.body || (await readBody(req)); // readBody for Vite preview mode

  // 1. Embed user query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  });

  const [{ embedding }] = embeddingResponse.data;

  // 2. Search Supabase
  const { data: matches, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 5,
  });

  // 3. If match found, return that
  if (matches && matches.length > 0) {
    const topMatch = matches[0];
    return res.json({ answer: topMatch.content });
  }

  // 4. Else fallback to GPT using metadata
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for Digital Marketing Genius, a web design agency.
You answer questions about services, industries, pricing, and timeline. Here is some metadata:\n\n${JSON.stringify(metadata)}`,
      },
      { role: 'user', content: question },
    ],
  });

  const gptAnswer = completion.choices[0].message.content;
  return res.json({ answer: gptAnswer });
}
*/

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    try {
      const { question } = req.body;
  
      // Embedding → Supabase → Match
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: question,
      });
      const [{ embedding }] = embeddingResponse.data;
  
      const { data: matches } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
      });
  
      if (matches && matches.length > 0) {
        return res.json({ answer: matches[0].content });
      }
  
      // GPT fallback
      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for Digital Marketing Genius. Use this metadata:\n\n${JSON.stringify(metadata)}`
          },
          { role: 'user', content: question }
        ]
      });
  
      const gptAnswer = gptResponse.choices[0].message.content;
      return res.json({ answer: gptAnswer });
  
    } catch (err) {
      console.error('❌ API Error:', err);
      return res.status(500).json({ error: 'Server error', detail: err.message });
    }
  }
  