// Import all the required libraries
import express from 'express'; // Express is used to create the web server
import cors from 'cors'; // CORS lets your React app talk to this server
import dotenv from 'dotenv'; // Loads .env variables (like API keys)
import OpenAI from 'openai'; // Used to call OpenAI's GPT models
import { createClient } from '@supabase/supabase-js'; // For connecting to your Supabase database
import metadata from './metadata.js'; // Your industry-specific demo metadata

// Load environment variables from .env
dotenv.config();

// Create an Express app (like creating a mini web server)
const app = express();

// Enable CORS so your React frontend can talk to this server
app.use(cors());

// Allow Express to understand JSON in requests
app.use(express.json());

// Connect to Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, // pulled from .env
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Connect to OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY, // pulled from .env
});

// Define an API route that handles POST requests to /api/ask
app.post('/api/ask', async (req, res) => {
  const { question } = req.body; // Get the question from the client

  // Step 1: Convert the question into an embedding using OpenAI
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  });

  const [{ embedding }] = embeddingResponse.data; // Extract the vector

  // Step 2: Search Supabase for relevant content using vector search
  const { data: matches, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 5,
  });

  // Step 3: If matches found in Supabase, return the top one
  if (matches && matches.length > 0) {
    const context = matches.map(m => m.content).join('\n');
  
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant for a web design agency. Use the following industry FAQs to answer questions:\n\n${context}`,
        },
        { role: 'user', content: question },
      ],
    });
  
    const gptAnswer = gptResponse.choices[0].message.content;
    return res.json({ answer: gptAnswer });
  }
  

  // Step 4: If no matches found, use GPT as fallback (using metadata)
  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant for a web design agency. Here is our service metadata:\n${JSON.stringify(
          metadata
        )}`,
      },
      { role: 'user', content: question },
    ],
  });

  const gptAnswer = gptResponse.choices[0].message.content;

  // Return GPT-generated answer to the frontend
  res.json({ answer: gptAnswer });
});

// Start the server on port 3001
app.listen(3001, () => {
  console.log('✅ API server is running at http://localhost:3001');
});
