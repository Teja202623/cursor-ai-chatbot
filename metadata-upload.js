import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import metadata from './metadata.js'; // adjust path if needed

// Setup clients
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

async function uploadMetadata() {
  for (const entry of metadata) {
    try {
      const textBlock = `
Industry: ${entry.industry}
URL: ${entry.demo_url}
Timeline: ${entry.timeline}
Price: ${entry.price}
Platforms: ${entry.platforms.join(', ')}
Features:
- ${entry.features.join('\n- ')}
      `.trim();

      // 1. Create embedding
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textBlock
      });

      const [{ embedding }] = embeddingRes.data;

      // 2. Insert into Supabase `docs` table
      const { error } = await supabase.from('docs').insert({
        content: textBlock,
        embedding,
        source: 'metadata',
        chunk_index: 0 // use 0 for metadata, FAQs have other numbers
      });

      if (error) {
        console.error(`❌ Failed to upload ${entry.industry}:`, error);
      } else {
        console.log(`✅ Uploaded ${entry.industry}`);
      }

    } catch (err) {
      console.error(`❌ Unexpected error for ${entry.industry}:`, err.message);
    }
  }

  console.log('🎉 Upload complete.');
}

uploadMetadata();
