import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import metadata from '../metadata.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    const { question } = req.body;

    // Step 1: Create embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });

    const [{ embedding }] = embeddingResponse.data;

    // Step 2: Query Supabase for semantic matches
    const { data: matches, error: matchError } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 3,
    });

    if (matchError) {
      console.error('❌ Supabase RPC Error:', matchError);
    }

    // Step 3: If we get a match, rewrite it using GPT
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

      const polished = rewriteResponse.choices?.[0]?.message?.content || null;

      if (!polished) {
        console.error('⚠️ GPT match rewrite failed:', JSON.stringify(rewriteResponse, null, 2));
        return res.json({ answer: "⚠️ I had trouble rewriting that. Please try again." });
      }

      return res.json({ answer: polished });
    }

    // Step 4: Fallback to metadata-driven GPT reply
    const fallbackResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a warm, persuasive chatbot assistant for Digital Marketing Genius, a web design agency in Australia.

Your goal is to help small business owners (like plumbers, electricians, landscapers, cleaners, and eCommerce store owners) feel confident that DMG can build them a high-quality website.

Use the structured metadata below when available. If the industry isn't listed, infer a similar one and confidently offer a tailored solution using similar pricing, timelines, features, and a relevant demo link.

Always mention:
- Estimated price ($1000–$1500 AUD)
- Timeline (7–14 days)
- Platform (WordPress or WooCommerce)
- Key features (quote form, trust badges, Google Maps, mobile responsive)

Be friendly, local, and helpful. If unsure, offer to chat more or contact DMG directly.

Metadata:\n\n${JSON.stringify(metadata)}`
        },
        { role: 'user', content: question }
      ]
    });

    const fallback = fallbackResponse.choices?.[0]?.message?.content;

    if (!fallback) {
      console.error('⚠️ GPT fallback failed:', JSON.stringify(fallbackResponse, null, 2));
      return res.json({ answer: "⚠️ Assistant was unable to respond. Please try again later." });
    }

    return res.json({ answer: fallback });

  } catch (err) {
    console.error('❌ API Error:', err);
    return res.status(500).json({
      error: 'Server error',
      detail: err.message
    });
  }
}
