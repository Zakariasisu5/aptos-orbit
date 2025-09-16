// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let body: any = null;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Invalid JSON body in request', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { message, context } = body || {};

    // Log incoming request for debugging (avoid logging auth headers)
    try {
      const safeHeaders: any = {};
      for (const [k, v] of Object.entries(req.headers || {})) {
        if (typeof k === 'string' && k.toLowerCase().includes('authorization')) continue;
        safeHeaders[k] = v;
      }
      console.log('chat-ai request', { ts: new Date().toISOString(), path: req.url || '/', headers: safeHeaders, body: message ? { message: String(message).slice(0, 200) } : null });
    } catch (logErr) {
      console.error('Failed to log request info', logErr);
    }

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid `message` in request body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create system prompt with app context
    const systemPrompt = `You are a helpful AI assistant for GlobePayX, a decentralized remittance and payroll platform built on the Aptos blockchain. 

Your role is to help users with:
- Wallet connection and authentication
- Sending and receiving money
- Currency swaps and FX rates
- Payroll processing and CSV uploads
- Transaction history and status
- Treasury management and insights
 - Currency swaps and FX rates (feature removed)
 - Treasury management and insights (feature removed)

Current user context:
${JSON.stringify(context, null, 2)}

Guidelines:
- Be friendly, concise, and helpful
- Use emojis sparingly but appropriately
- Provide actionable steps when possible
- Mention specific GlobePayX features and pages
- If suggesting navigation, respond with clear instructions
- For complex issues, offer to escalate to human support
- Always prioritize user security and best practices

Keep responses under 200 words unless detailed explanation is needed.`;

    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
    } catch (fetchErr) {
      console.error('Fetch to OpenAI failed:', fetchErr);
      return new Response(JSON.stringify({ error: 'Failed to contact OpenAI API' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!response || !response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (_) {
        // ignore
      }
      console.error('OpenAI API returned an error', response ? response.status : 'no-response', errorData);
      return new Response(JSON.stringify({ error: 'OpenAI API error', details: errorData }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    // Guard access to nested fields
    const aiResponse = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? String(data.choices[0].message.content)
      : null;

    if (!aiResponse) {
      console.error('OpenAI response missing expected fields', data);
      return new Response(JSON.stringify({ error: 'OpenAI response missing content', details: data }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Detect if response suggests navigation (safe guard)
    let suggestedAction: string | null = null;
    try {
      const lower = aiResponse.toLowerCase();
      if (lower.includes('send money') || lower.includes('send page')) {
        suggestedAction = 'open_send_money';
      } else if (lower.includes('receive money') || lower.includes('receive page')) {
        suggestedAction = 'open_receive_money';
      } else if (lower.includes('payroll')) {
        suggestedAction = 'open_payroll';
      } else if (lower.includes('transactions') || lower.includes('history')) {
        suggestedAction = 'open_transactions';
      } else if (lower.includes('dashboard')) {
        suggestedAction = 'open_dashboard';
      }
    } catch (e) {
      console.error('Error while extracting suggested action from AI response', e, { aiResponse });
      suggestedAction = null;
    }

    console.log('AI response and suggestedAction:', { aiResponse, suggestedAction });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      action: suggestedAction 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm experiencing technical difficulties. Please try again or contact support if the issue persists."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});