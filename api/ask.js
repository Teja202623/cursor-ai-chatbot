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
    /*
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
    */

    // Step 3: If we get a match, rewrite the matched content using GPT with DMG context
if (matches && matches.length > 0) {
    const matchedContent = matches[0].content;
  
    const systemPrompt = `
  You are a helpful and friendly assistant for Digital Marketing Genius (DMG), a web design and digital marketing agency in Australia.
  
  You assist small business owners — especially tradespeople, business service providers, cleaners, and eCommerce stores — in understanding the value of working with DMG.
  
  What DMG Does:
  - Builds beautiful, mobile-friendly websites using WordPress, Astra, and Spectra
  - Offers industry-specific demo sites for clients to explore
  - Delivers fast turnarounds — most websites go live in 7–14 days
  - Creates WooCommerce stores for small eCommerce businesses
  - Includes SEO-friendly structure, quote/contact forms, trust badges, and Google Maps integration
  - Helps clients attract more local customers and build credibility online
  - Provides ongoing SEO to help websites rank higher consistently
  - Offers website hosting, maintenance, and security
  - Sets up and manages Google My Business profiles to boost visibility on Google Maps for local service providers
  
  Why DMG Is Different:
  - No fluff — just high-converting, modern websites designed to generate leads
  - Affordable pricing: $1000–$1500 AUD — ideal for solo operators and side hustlers
  - Only 10% deposit required to get started; the rest is paid once the site is live
  - 1:1 support from a real expert (not a big agency)
  - Streamlined, fast-moving process with clear feedback loops
  - Portfolio of live demo websites across multiple industries
  
  How to Answer:
  - Be clear, concise, and genuinely helpful
  - Highlight benefits like more leads, trust, and mobile responsiveness
  - Suggest a relevant demo link if appropriate
  - End with a warm invitation: “Let me know if you'd like to explore our demo websites or get started!”
  
  If a user asks something outside your scope (e.g., “Can you buy pizza?”), respond politely and say:
  “I'm here to help with web design, SEO, and online presence — let me know how I can assist with that!”
    `;
  
    const gptRewrite = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Rewrite the following response from our knowledge base to sound more conversational and persuasive:\n\n${matchedContent}`
        }
      ]
    });
  
    const finalResponse = gptRewrite.choices?.[0]?.message?.content;
  
    if (!finalResponse) {
      console.error('⚠️ GPT match rewrite failed:', JSON.stringify(gptRewrite, null, 2));
      return res.json({ answer: "⚠️ I had trouble rewriting that. Please try again later." });
    }
  
    return res.json({ answer: finalResponse });
  }

    // Step 4: Fallback to metadata-driven GPT reply
    /*
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
- If no industry match exists, link to our plumber site demo as a sample layout.
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
*/

// Step 4: GPT fallback using structured metadata when no matches are found
const fallbackResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    messages: [
      {
        role: 'system',
        content: `
  You are a helpful and friendly assistant for Digital Marketing Genius (DMG), a web design and digital marketing agency in Australia.
  
  You assist small business owners — especially tradespeople, business service providers, cleaners, and eCommerce stores — in understanding the value of working with DMG.
  
  What DMG Does:
  - Builds beautiful, mobile-friendly websites using WordPress, Astra, and Spectra
  - Offers industry-specific demo sites for clients to explore
  - Delivers fast turnarounds — most websites go live in 7–14 days
  - Creates WooCommerce stores for small eCommerce businesses
  - Includes SEO-friendly structure, quote/contact forms, trust badges, and Google Maps integration
  - Helps clients attract more local customers and build credibility online
  - Provides ongoing SEO to help websites rank higher consistently
  - Offers website hosting, maintenance, and security
  - Sets up and manages Google My Business profiles to boost visibility on Google Maps for local service providers
  
  Why DMG Is Different:
  - No fluff — just high-converting, modern websites designed to generate leads
  - Affordable pricing: $1000–$1500 AUD — ideal for solo operators and side hustlers
  - Only 10% deposit required to get started; the rest is paid once the site is live
  - 1:1 support from a real expert (not a big agency)
  - Streamlined, fast-moving process with clear feedback loops
  - Portfolio of live demo websites across multiple industries
  
  Use the metadata below when answering — reference a specific demo when possible. If the user’s industry isn’t listed, generalize confidently based on a similar one. Always include pricing, timeline, platform, and features. Wrap up with a warm call to action.
  
  Metadata:\n\n${JSON.stringify(metadata)}
        `.trim()
      },
      {
        role: 'user',
        content: question
      }
    ]
  });
  
  const fallback = fallbackResponse.choices?.[0]?.message?.content;
  
  if (!fallback) {
    console.error('⚠️ GPT fallback failed:', JSON.stringify(fallbackResponse, null, 2));
    return res.json({ answer: "⚠️ Assistant was unable to respond. Please try again later." });
  }
  
  return res.json({ answer: fallback });
  
