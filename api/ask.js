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

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Invalid question input' });
    }

    // Step 1: Create embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });

    const [{ embedding }] = embeddingResponse.data;

    // Step 2: Supabase match
    const { data: matches, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) {
      console.error('❌ Supabase error:', error.message);
    }

    if (matches && matches.length > 0) {
      return res.status(200).json({ answer: matches[0].content });
    }

    // Step 3: Fallback to GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant for Digital Marketing Genius, a web design agency. Here is some metadata:\n\n${JSON.stringify(metadata)}`
        },
        { role: 'user', content: question }
      ]
    });

    const gptAnswer = completion.choices?.[0]?.message?.content || 'No response generated.';
    return res.status(200).json({ answer: gptAnswer });

  } catch (err) {
    console.error('❌ API Error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
