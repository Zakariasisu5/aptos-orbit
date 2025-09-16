// Simple Node test harness to call the deployed Supabase Edge Function for debugging
// Usage: node invoke.js <FUNCTION_URL> <API_KEY>

const fetch = require('node-fetch');

async function main() {
  const [,, url, apiKey] = process.argv;
  if (!url || !apiKey) {
    console.error('Usage: node invoke.js <FUNCTION_URL> <API_KEY>');
    process.exit(1);
  }

  const body = {
    message: 'Hello, how do I send money?',
    context: { userId: 'test-user' }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        apikey: apiKey,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    try {
      console.log('Body (JSON):', JSON.parse(text));
    } catch (e) {
      console.log('Body (raw):', text);
    }
  } catch (e) {
    console.error('Invoke failed:', e);
  }
}

main();
