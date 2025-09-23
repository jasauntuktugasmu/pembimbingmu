import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhookType, message, sessionId, documentId, file } = await req.json();
    
    let webhookUrl = '';
    let payload: any = {};

    // Determine webhook URL and payload based on type
    switch (webhookType) {
      case 'ruang_cerita':
        webhookUrl = 'https://n8n.srv995808.hstgr.cloud/webhook/ruangcerita';
        payload = { message, sessionId };
        break;
      case 'asisten_akademik':
        webhookUrl = 'https://n8n.srv995808.hstgr.cloud/webhook/botkonsultasiskripsi';
        payload = { message, documentId };
        break;
      case 'input_skripsi':
        webhookUrl = 'https://n8n.srv995808.hstgr.cloud/webhook/inputskripsi';
        // For file uploads, we'll need to handle differently
        break;
      default:
        throw new Error('Invalid webhook type');
    }

    console.log('Proxying request to:', webhookUrl, 'with payload:', payload);

    // Make request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    });

  } catch (error) {
    console.error('Webhook proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Proxy error', 
        message: 'Terjadi kesalahan saat menghubungi server. Silakan coba lagi.',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});