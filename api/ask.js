import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import metadata from '../metadata.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question } = req.body;

    // Step 1: Get embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });
    const [{ embedding }] = embeddingResponse.data;

    // Step 2: Query Supabase
    const { data: matches } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 3,
    });

    // Step 3: If match, use GPT to rewrite it nicely
    if (matches && matches.length > 0) {
      const topAnswer = matches[0].content;

      const rewriteResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful and friendly sales assistant for Digital Marketing Genius, a web design agency in Australia. Rewrite the following answer from our knowledge base so it's more conversational and persuasive for a chatbot. Keep it accurate and helpful.`
          },
          {
            role: 'user',
            content: `Rewrite this answer:\n\n${topAnswer}`
          }
        ]
      });

      const polished = rewriteResponse.choices[0].message.content;
      return res.json({ answer: polished });
    }

    // Step 4: GPT fallback using metadata
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant for Digital Marketing Genius, a web design agency in Australia. Use this metadata to answer the user's question:\n\n${JSON.stringify(metadata)}`
        },
        { role: 'user', content: question }
      ]
    });

    const fallback = gptResponse.choices[0].message.content;
    return res.json({ answer: fallback });

  } catch (err) {
    console.error('❌ API Error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
