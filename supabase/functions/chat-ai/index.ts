import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Detect if response suggests navigation
    let suggestedAction = null;
    if (aiResponse.toLowerCase().includes('send money') || aiResponse.toLowerCase().includes('send page')) {
      suggestedAction = 'open_send_money';
    } else if (aiResponse.toLowerCase().includes('receive money') || aiResponse.toLowerCase().includes('receive page')) {
      suggestedAction = 'open_receive_money';
    } else if (aiResponse.toLowerCase().includes('forex') || aiResponse.toLowerCase().includes('swap') || aiResponse.toLowerCase().includes('exchange')) {
      suggestedAction = 'open_forex';
    } else if (aiResponse.toLowerCase().includes('payroll')) {
      suggestedAction = 'open_payroll';
    } else if (aiResponse.toLowerCase().includes('treasury')) {
      suggestedAction = 'open_treasury';
    } else if (aiResponse.toLowerCase().includes('transactions') || aiResponse.toLowerCase().includes('history')) {
      suggestedAction = 'open_transactions';
    } else if (aiResponse.toLowerCase().includes('dashboard')) {
      suggestedAction = 'open_dashboard';
    }

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